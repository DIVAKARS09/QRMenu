import { Router, Response } from 'express';
import { dbStore } from '../store';
import { authenticateToken, AuthRequest } from '../auth';

export const foodRouter = Router();

// Get all food items for a shop
foodRouter.get('/shop/:shopId', (req, res) => {
  try {
    const { shopId } = req.params;
    const foods = dbStore.getFoodsByShopId(shopId);
    return res.json(foods);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch food items' });
  }
});

// Create new food item
foodRouter.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const {
      shopId,
      categoryId,
      name,
      description,
      image,
      price,
      isVegetarian,
      isAvailable,
      isFeatured,
      preparationTime,
      tags,
    } = req.body;

    if (!shopId || !name || !categoryId || price === undefined) {
      return res.status(400).json({ error: 'shopId, categoryId, name, and valid price are required' });
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid positive number' });
    }

    const shop = dbStore.findShopById(shopId);
    if (!shop || (shop.ownerId !== req.user!._id && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized to add food to this shop' });
    }

    const existingFoods = dbStore.getFoodsByShopId(shopId);

    const newFood = dbStore.createFood({
      shopId,
      categoryId,
      name: name.trim(),
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      price: numPrice,
      isVegetarian: Boolean(isVegetarian),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      isFeatured: Boolean(isFeatured),
      preparationTime: preparationTime || '5-10 mins',
      displayOrder: existingFoods.length + 1,
      tags: Array.isArray(tags) ? tags : [],
    });

    return res.status(201).json(newFood);
  } catch (err: any) {
    console.error('Error creating food item:', err);
    return res.status(500).json({ error: 'Failed to create food item' });
  }
});

// Update food item
foodRouter.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const food = dbStore.getFoodById(id);

    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const shop = dbStore.findShopById(food.shopId);
    if (!shop || (shop.ownerId !== req.user!._id && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized to update this food item' });
    }

    const updates: any = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.categoryId !== undefined) updates.categoryId = req.body.categoryId;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.image !== undefined) updates.image = req.body.image;
    if (req.body.price !== undefined) {
      const p = Number(req.body.price);
      if (isNaN(p) || p < 0) return res.status(400).json({ error: 'Invalid price' });
      updates.price = p;
    }
    if (req.body.isVegetarian !== undefined) updates.isVegetarian = Boolean(req.body.isVegetarian);
    if (req.body.isAvailable !== undefined) updates.isAvailable = Boolean(req.body.isAvailable);
    if (req.body.isFeatured !== undefined) updates.isFeatured = Boolean(req.body.isFeatured);
    if (req.body.preparationTime !== undefined) updates.preparationTime = req.body.preparationTime;
    if (req.body.displayOrder !== undefined) updates.displayOrder = Number(req.body.displayOrder);
    if (req.body.tags !== undefined) updates.tags = req.body.tags;

    const updated = dbStore.updateFood(id, updates);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update food item' });
  }
});

// Toggle availability instantly (1-click from admin table)
foodRouter.patch('/:id/availability', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const food = dbStore.getFoodById(id);

    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const shop = dbStore.findShopById(food.shopId);
    if (!shop || (shop.ownerId !== req.user!._id && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized to modify food status' });
    }

    const targetState = req.body.isAvailable !== undefined ? Boolean(req.body.isAvailable) : undefined;
    const updated = dbStore.toggleFoodAvailability(id, targetState);

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Toggle Today's Special (1-click featured status)
foodRouter.patch('/:id/special', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const food = dbStore.getFoodById(id);

    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const shop = dbStore.findShopById(food.shopId);
    if (!shop || (shop.ownerId !== req.user!._id && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const targetState = req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : undefined;
    const updated = dbStore.toggleFoodFeatured(id, targetState);

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update special status' });
  }
});

// Delete food item
foodRouter.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const food = dbStore.getFoodById(id);

    if (!food) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    const shop = dbStore.findShopById(food.shopId);
    if (!shop || (shop.ownerId !== req.user!._id && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized to delete this food item' });
    }

    const success = dbStore.deleteFood(id);
    return res.json({ success, message: 'Food item deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete food item' });
  }
});
