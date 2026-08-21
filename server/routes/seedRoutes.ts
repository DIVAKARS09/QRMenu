import { Router } from 'express';
import { dbStore } from '../store';

export const seedRouter = Router();

// Reset data to initial rich seed state
seedRouter.post('/reset', (_req, res) => {
  try {
    const newState = dbStore.resetToSeed();
    return res.json({
      message: 'Database reset to default seed successfully',
      shopsCount: newState.shops.length,
      foodsCount: newState.foods.length,
      categoriesCount: newState.categories.length,
      ordersCount: newState.orders.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset seed data' });
  }
});
