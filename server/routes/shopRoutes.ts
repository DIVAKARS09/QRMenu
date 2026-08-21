import { Router, Response } from 'express';
import { dbStore } from '../store';
import { authenticateToken, AuthRequest } from '../auth';

export const shopRouter = Router();

// Public: Get shop and full menu by slug
shopRouter.get('/public/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const shop = dbStore.findShopBySlug(slug);

    if (!shop) {
      return res.status(404).json({
        error: 'Shop Not Found',
        message: 'This digital menu may no longer be available or the URL is incorrect.',
      });
    }

    const categories = dbStore.getCategoriesByShopId(shop._id).filter((c) => c.isActive);
    const foods = dbStore.getFoodsByShopId(shop._id);

    return res.json({
      shop,
      categories,
      foods,
    });
  } catch (err: any) {
    console.error('Error fetching public shop:', err);
    return res.status(500).json({ error: 'Failed to load shop menu' });
  }
});

// List all shops for discovery
shopRouter.get('/', (_req, res) => {
  try {
    const shops = dbStore.getAllShops();
    return res.json(shops);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to list shops' });
  }
});

// Authenticated: Get owner's shop
shopRouter.get('/my-shop', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const shop = dbStore.findShopByOwnerId(user._id);

    if (!shop) {
      return res.status(404).json({ error: 'No shop associated with this owner account' });
    }

    return res.json(shop);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve shop' });
  }
});

// Authenticated: Update shop settings
shopRouter.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const existingShop = dbStore.findShopById(id);

    if (!existingShop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (existingShop.ownerId !== user._id && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to update this shop' });
    }

    const allowedFields = [
      'name',
      'logo',
      'coverImage',
      'description',
      'phone',
      'whatsappNumber',
      'address',
      'location',
      'openingTime',
      'closingTime',
      'isOpen',
      'currency',
      'orderingEnabled',
      'whatsappOrderingEnabled',
      'upiId',
      'customTagline',
    ];

    const updates: any = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // If name changes and slug is not provided, optionally re-slugify or keep slug stable
    if (req.body.slug && req.body.slug !== existingShop.slug) {
      const cleanSlug = req.body.slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const slugOwner = dbStore.findShopBySlug(cleanSlug);
      if (slugOwner && slugOwner._id !== existingShop._id) {
        return res.status(400).json({ error: 'This shop URL slug is already taken. Please choose another.' });
      }
      updates.slug = cleanSlug;
    }

    const updated = dbStore.updateShop(id, updates);
    return res.json(updated);
  } catch (err: any) {
    console.error('Error updating shop:', err);
    return res.status(500).json({ error: 'Failed to update shop profile' });
  }
});
