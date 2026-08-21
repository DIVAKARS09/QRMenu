import { Router, Response } from 'express';
import { dbStore } from '../store';
import { authenticateToken, AuthRequest } from '../auth';
import { OrderStatus } from '../../src/types';

export const orderRouter = Router();

// Customer creates an order
orderRouter.post('/', (req, res) => {
  try {
    const { shopId, customerName, customerPhone, items, notes } = req.body;

    if (!shopId || !customerName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Shop ID, customer name, and at least one order item are required' });
    }

    const shop = dbStore.findShopById(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    if (!shop.isOpen) {
      return res.status(400).json({ error: 'This food shop is currently closed and not accepting orders right now.' });
    }

    if (!shop.orderingEnabled) {
      return res.status(400).json({ error: 'Ordering is currently disabled for this shop.' });
    }

    // Validate and sanitize items
    const sanitizedItems = items.map((it: any) => {
      const food = dbStore.getFoodById(it.foodItemId);
      const price = food ? food.price : Number(it.price) || 0;
      const name = food ? food.name : String(it.name || 'Food Item');
      const qty = Math.max(1, Number(it.quantity) || 1);
      return {
        foodItemId: it.foodItemId,
        name,
        quantity: qty,
        price,
        total: price * qty,
        isVegetarian: food ? food.isVegetarian : it.isVegetarian,
      };
    });

    const newOrder = dbStore.createOrder({
      shopId,
      customerName: customerName.trim(),
      customerPhone: customerPhone ? customerPhone.trim() : '',
      items: sanitizedItems,
      notes: notes || '',
    });

    return res.status(201).json(newOrder);
  } catch (err: any) {
    console.error('Error creating order:', err);
    return res.status(500).json({ error: 'Failed to place order' });
  }
});

// Authenticated owner gets orders for their shop
orderRouter.get('/shop/:shopId', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { shopId } = req.params;
    const shop = dbStore.findShopById(shopId);

    if (!shop || (shop.ownerId !== req.user!._id && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized to view orders for this shop' });
    }

    const orders = dbStore.getOrdersByShopId(shopId);
    return res.json(orders);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Public / Customer track order by order ID
orderRouter.get('/:id/track', (req, res) => {
  try {
    const { id } = req.params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const shop = dbStore.findShopById(order.shopId);

    return res.json({
      order,
      shop: shop
        ? {
            name: shop.name,
            phone: shop.phone,
            whatsappNumber: shop.whatsappNumber,
            address: shop.address,
            location: shop.location,
            currency: shop.currency,
          }
        : null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to track order' });
  }
});

// Owner updates order status
orderRouter.patch('/:id/status', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: OrderStatus[] = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = dbStore.getOrderById(id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const shop = dbStore.findShopById(order.shopId);
    if (!shop || (shop.ownerId !== req.user!._id && req.user!.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized to update this order' });
    }

    const updatedOrder = dbStore.updateOrderStatus(id, status);
    return res.json(updatedOrder);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});
