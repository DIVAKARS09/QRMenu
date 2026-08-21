import { Router, Response } from 'express';
import { dbStore } from '../store';
import { authenticateToken, AuthRequest } from '../auth';

export const categoryRouter = Router();

// Get categories for a shop
categoryRouter.get('/shop/:shopId', (req, res) => {
  try {
    const { shopId } = req.params;
    const categories = dbStore.getCategoriesByShopId(shopId);
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category
categoryRouter.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { shopId, name, description, image, displayOrder, isActive } = req.body;

    if (!shopId || !name) {
      return res.status(400).json({ error: 'shopId and name are required' });
    }

    const shop = dbStore.findShopById(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (shop.ownerId !== req.user!._id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to add categories to this shop' });
    }

    const existingCats = dbStore.getCategoriesByShopId(shopId);
    const order = displayOrder !== undefined ? Number(displayOrder) : existingCats.length + 1;

    const newCategory = dbStore.createCategory({
      shopId,
      name: name.trim(),
      description: description || '',
      image: image || '',
      displayOrder: order,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json(newCategory);
  } catch (err: any) {
    console.error('Error creating category:', err);
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
categoryRouter.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const category = dbStore.getCategoryById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const shop = dbStore.findShopById(category.shopId);
    if (!shop || (shop.ownerId !== req.user!._id && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized to modify this category' });
    }

    const updates: any = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.image !== undefined) updates.image = req.body.image;
    if (req.body.displayOrder !== undefined) updates.displayOrder = Number(req.body.displayOrder);
    if (req.body.isActive !== undefined) updates.isActive = Boolean(req.body.isActive);

    const updated = dbStore.updateCategory(id, updates);
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
categoryRouter.delete('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const category = dbStore.getCategoryById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const shop = dbStore.findShopById(category.shopId);
    if (!shop || (shop.ownerId !== req.user!._id && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized to delete this category' });
    }

    const success = dbStore.deleteCategory(id);
    return res.json({ success, message: 'Category removed successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete category' });
  }
});
