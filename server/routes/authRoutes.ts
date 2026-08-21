import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../store';
import { generateToken, authenticateToken, AuthRequest } from '../auth';

export const authRouter = Router();

// Register new shop owner
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, shopName, location, address } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = dbStore.createUser({
      name,
      email,
      phone: phone || '',
      password: hashedPassword,
      role: 'owner',
    });

    // Create default shop for this owner
    const cleanShopName = shopName || `${name}'s Food Truck`;
    let slugBase = cleanShopName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slugBase) slugBase = 'food-shop';

    // Ensure unique slug
    let slug = slugBase;
    let counter = 1;
    while (dbStore.findShopBySlug(slug)) {
      slug = `${slugBase}-${counter++}`;
    }

    const shop = dbStore.createShop({
      ownerId: user._id,
      name: cleanShopName,
      slug,
      logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
      description: 'Fresh street food prepared hot and served fast from our 4-wheel mobile shop.',
      phone: phone || '+91 98765 43210',
      whatsappNumber: phone ? phone.replace(/[^0-9+]/g, '') : '+919876543210',
      address: address || 'Roadside Corner',
      location: location || 'Main City Area',
      openingTime: '05:00 PM',
      closingTime: '11:00 PM',
      isOpen: true,
      currency: '₹',
      orderingEnabled: true,
      whatsappOrderingEnabled: true,
      customTagline: 'Fresh • Fast • Delicious',
    });

    // Create 3 basic initial starter categories
    const cat1 = dbStore.createCategory({ shopId: shop._id, name: "Today's Special", displayOrder: 1, isActive: true });
    const cat2 = dbStore.createCategory({ shopId: shop._id, name: 'Main Course', displayOrder: 2, isActive: true });
    const cat3 = dbStore.createCategory({ shopId: shop._id, name: 'Beverages', displayOrder: 3, isActive: true });

    // Starter food items
    dbStore.createFood({
      shopId: shop._id,
      categoryId: cat2._id,
      name: 'Special Fried Rice',
      description: 'Hot tawa wok fried rice with fresh veggies and spices.',
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
      price: 120,
      isVegetarian: true,
      isAvailable: true,
      isFeatured: true,
      preparationTime: '8 mins',
      displayOrder: 1,
    });

    const token = generateToken(user);
    const { password: _, ...userWithoutPass } = user;

    return res.status(201).json({
      token,
      user: userWithoutPass,
      shop,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login shop owner
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = dbStore.findUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const shop = dbStore.findShopByOwnerId(user._id);
    const { password: _, ...userWithoutPass } = user;

    return res.json({
      token,
      user: userWithoutPass,
      shop,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current logged-in user profile & shop
authRouter.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const shop = dbStore.findShopByOwnerId(user._id);
  const { password: _, ...userWithoutPass } = user;

  return res.json({
    user: userWithoutPass,
    shop,
  });
});
