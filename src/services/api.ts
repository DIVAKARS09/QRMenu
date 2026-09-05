import { User, Shop, Category, FoodItem, Order, OrderStatus, PublicShopData, AuthResponse } from '../types';
import { localDb } from './localStore';
import { defaultShops } from './mockData';
import QRCode from 'qrcode';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('scanmenu_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // --- Auth ---
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) return res.json();
    } catch {
      // Backend not reached, fallback to local store
    }

    // Client-side local fallback
    const users = localDb.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid email or password');
    }
    const shops = localDb.getShops();
    const shop = shops.find((s) => s.ownerId === user._id) || shops[0];
    const token = 'mock_jwt_token_' + user._id;
    localStorage.setItem('scanmenu_token', token);
    return { token, user, shop };
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    shopName?: string;
    location?: string;
  }): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const now = new Date().toISOString();
    const users = localDb.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Email is already registered');
    }

    const newUser: User = {
      _id: 'user-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      role: 'owner',
      createdAt: now,
      updatedAt: now,
    };
    users.push(newUser);
    localDb.saveUsers(users);

    const slug = (data.shopName || data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'food-truck';
    const newShop: Shop = {
      _id: 'shop-' + Date.now(),
      ownerId: newUser._id,
      name: data.shopName || `${data.name}'s Food Truck`,
      slug: slug,
      logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
      description: 'Hot street bites freshly prepared on order.',
      phone: data.phone || '',
      whatsappNumber: data.phone || '',
      address: data.location || 'Roadside Food Point',
      location: data.location || 'City Center',
      openingTime: '05:00 PM',
      closingTime: '11:00 PM',
      isOpen: true,
      currency: '₹',
      orderingEnabled: true,
      whatsappOrderingEnabled: true,
      customTagline: 'Scan • Order • Enjoy Fresh Bites',
      createdAt: now,
      updatedAt: now,
    };
    const shops = localDb.getShops();
    shops.push(newShop);
    localDb.saveShops(shops);

    const token = 'mock_jwt_token_' + newUser._id;
    localStorage.setItem('scanmenu_token', token);
    return { token, user: newUser, shop: newShop };
  },

  async getMe(): Promise<{ user: User; shop?: Shop }> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const token = localStorage.getItem('scanmenu_token');
    if (!token) throw new Error('Unauthorized');
    const users = localDb.getUsers();
    const shops = localDb.getShops();
    const user = users[0];
    const shop = shops.find((s) => s.ownerId === user?._id) || shops[0];
    return { user, shop };
  },

  // --- Public Shop & Menu ---
  async getPublicShopMenu(slug: string): Promise<PublicShopData> {
    try {
      const res = await fetch(`${API_BASE}/shops/public/${slug}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API fetch failed, checking local browser storage fallback:', e);
    }

    // Client-side fallback lookup
    const shops = localDb.getShops();
    // Match by slug or id or case-insensitive name
    const cleanSlug = slug.toLowerCase().trim();
    let shop = shops.find((s) => s.slug.toLowerCase() === cleanSlug || s._id === cleanSlug);
    
    // If not found by exact slug, match partial or default to first shop if slug is general
    if (!shop && shops.length > 0) {
      shop = shops.find((s) => s.name.toLowerCase().includes(cleanSlug)) || shops[0];
    }

    if (!shop) {
      throw new Error('Shop not found');
    }

    const categories = localDb.getCategories().filter((c) => c.shopId === shop?._id && c.isActive);
    const foods = localDb.getFoods().filter((f) => f.shopId === shop?._id);

    return {
      shop,
      categories,
      foods,
    };
  },

  async getAllShops(): Promise<Shop[]> {
    try {
      const res = await fetch(`${API_BASE}/shops`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch {
      // fallback
    }
    const local = localDb.getShops();
    return Array.isArray(local) && local.length > 0 ? local : defaultShops;
  },

  async updateShop(id: string, updates: Partial<Shop>): Promise<Shop> {
    try {
      const res = await fetch(`${API_BASE}/shops/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const shops = localDb.getShops();
    const index = shops.findIndex((s) => s._id === id);
    if (index === -1) throw new Error('Shop not found');
    const updated = { ...shops[index], ...updates, updatedAt: new Date().toISOString() };
    shops[index] = updated;
    localDb.saveShops(shops);
    return updated;
  },

  // --- Categories ---
  async getCategories(shopId: string): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories/shop/${shopId}`);
      if (res.ok) return res.json();
    } catch {
      // fallback
    }
    return localDb.getCategories().filter((c) => c.shopId === shopId);
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const newCat: Category = {
      _id: 'cat-' + Date.now(),
      shopId: data.shopId || 'shop-annapoorna',
      name: data.name || 'New Category',
      description: data.description,
      displayOrder: data.displayOrder || 99,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const cats = localDb.getCategories();
    cats.push(newCat);
    localDb.saveCategories(cats);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const cats = localDb.getCategories();
    const index = cats.findIndex((c) => c._id === id);
    if (index === -1) throw new Error('Category not found');
    const updated = { ...cats[index], ...updates, updatedAt: new Date().toISOString() };
    cats[index] = updated;
    localDb.saveCategories(cats);
    return updated;
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) return true;
    } catch {
      // fallback
    }

    const cats = localDb.getCategories().filter((c) => c._id !== id);
    localDb.saveCategories(cats);
    return true;
  },

  // --- Foods ---
  async getFoods(shopId: string): Promise<FoodItem[]> {
    try {
      const res = await fetch(`${API_BASE}/foods/shop/${shopId}`);
      if (res.ok) return res.json();
    } catch {
      // fallback
    }
    return localDb.getFoods().filter((f) => f.shopId === shopId);
  },

  async createFood(data: Partial<FoodItem>): Promise<FoodItem> {
    try {
      const res = await fetch(`${API_BASE}/foods`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const newFood: FoodItem = {
      _id: 'food-' + Date.now(),
      shopId: data.shopId || 'shop-annapoorna',
      categoryId: data.categoryId || '',
      name: data.name || 'New Dish',
      description: data.description || '',
      image: data.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      price: Number(data.price) || 0,
      isVegetarian: Boolean(data.isVegetarian),
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      isFeatured: Boolean(data.isFeatured),
      preparationTime: data.preparationTime || '5-10 mins',
      displayOrder: data.displayOrder || 99,
      tags: data.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const foods = localDb.getFoods();
    foods.push(newFood);
    localDb.saveFoods(foods);
    return newFood;
  },

  async updateFood(id: string, updates: Partial<FoodItem>): Promise<FoodItem> {
    try {
      const res = await fetch(`${API_BASE}/foods/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const foods = localDb.getFoods();
    const index = foods.findIndex((f) => f._id === id);
    if (index === -1) throw new Error('Food not found');
    const updated = { ...foods[index], ...updates, updatedAt: new Date().toISOString() };
    foods[index] = updated;
    localDb.saveFoods(foods);
    return updated;
  },

  async toggleFoodAvailability(id: string, isAvailable?: boolean): Promise<FoodItem> {
    try {
      const res = await fetch(`${API_BASE}/foods/${id}/availability`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isAvailable }),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const foods = localDb.getFoods();
    const index = foods.findIndex((f) => f._id === id);
    if (index === -1) throw new Error('Food not found');
    const newVal = isAvailable !== undefined ? isAvailable : !foods[index].isAvailable;
    const updated = { ...foods[index], isAvailable: newVal, updatedAt: new Date().toISOString() };
    foods[index] = updated;
    localDb.saveFoods(foods);
    return updated;
  },

  async toggleFoodSpecial(id: string, isFeatured?: boolean): Promise<FoodItem> {
    try {
      const res = await fetch(`${API_BASE}/foods/${id}/special`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isFeatured }),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const foods = localDb.getFoods();
    const index = foods.findIndex((f) => f._id === id);
    if (index === -1) throw new Error('Food not found');
    const newVal = isFeatured !== undefined ? isFeatured : !foods[index].isFeatured;
    const updated = { ...foods[index], isFeatured: newVal, updatedAt: new Date().toISOString() };
    foods[index] = updated;
    localDb.saveFoods(foods);
    return updated;
  },

  async deleteFood(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/foods/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) return true;
    } catch {
      // fallback
    }

    const foods = localDb.getFoods().filter((f) => f._id !== id);
    localDb.saveFoods(foods);
    return true;
  },

  // --- Orders ---
  async createOrder(data: {
    shopId: string;
    customerName: string;
    customerPhone: string;
    items: Order['items'];
    notes?: string;
  }): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const orders = localDb.getOrders();
    const nextNum = orders.length + 101;
    const total = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const newOrder: Order = {
      _id: 'order-' + Date.now(),
      orderNumber: nextNum,
      shopId: data.shopId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      items: data.items,
      subtotal: total,
      total: total,
      status: 'Pending',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    localDb.saveOrders(orders);
    return newOrder;
  },

  async getOrders(shopId: string): Promise<Order[]> {
    try {
      const res = await fetch(`${API_BASE}/orders/shop/${shopId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }
    return localDb.getOrders().filter((o) => o.shopId === shopId);
  },

  async trackOrder(orderId: string): Promise<{ order: Order; shop: Partial<Shop> | null }> {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/track`);
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const orders = localDb.getOrders();
    const order = orders.find((o) => o._id === orderId);
    if (!order) throw new Error('Order not found');
    const shop = localDb.getShops().find((s) => s._id === order.shopId) || null;
    return { order, shop };
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const orders = localDb.getOrders();
    const index = orders.findIndex((o) => o._id === id);
    if (index === -1) throw new Error('Order not found');
    const updated = { ...orders[index], status, updatedAt: new Date().toISOString() };
    orders[index] = updated;
    localDb.saveOrders(orders);
    return updated;
  },

  // --- QR Code ---
  async getQRCode(slug: string): Promise<{ slug: string; shopName: string; targetUrl: string; qrDataUrl: string; qrSvg: string }> {
    try {
      const res = await fetch(`${API_BASE}/qr/generate/${slug}`);
      if (res.ok) return res.json();
    } catch {
      // fallback
    }

    const shop = localDb.getShops().find((s) => s.slug === slug) || localDb.getShops()[0];
    const targetUrl = `${window.location.origin}/menu/${slug}`;
    const qrDataUrl = await QRCode.toDataURL(targetUrl, { width: 600, margin: 2 });
    return {
      slug,
      shopName: shop?.name || 'Roadside Food Truck',
      targetUrl,
      qrDataUrl,
      qrSvg: '',
    };
  },

  // --- Reset demo data ---
  async resetSeed(): Promise<void> {
    try {
      await fetch(`${API_BASE}/seed/reset`, { method: 'POST' });
    } catch {
      // fallback
    }
    localDb.resetAll();
  },
};
