import { User, Shop, Category, FoodItem, Order, OrderStatus, PublicShopData, AuthResponse } from '../types';

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
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    shopName?: string;
    location?: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User; shop?: Shop }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Unauthorized');
    }
    return res.json();
  },

  // --- Public Shop & Menu ---
  async getPublicShopMenu(slug: string): Promise<PublicShopData> {
    const res = await fetch(`${API_BASE}/shops/public/${slug}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Shop not found' }));
      throw new Error(err.error || err.message || 'Failed to load shop menu');
    }
    return res.json();
  },

  async getAllShops(): Promise<Shop[]> {
    const res = await fetch(`${API_BASE}/shops`);
    if (!res.ok) throw new Error('Failed to load shops');
    return res.json();
  },

  async updateShop(id: string, updates: Partial<Shop>): Promise<Shop> {
    const res = await fetch(`${API_BASE}/shops/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update shop' }));
      throw new Error(err.error || 'Failed to update shop');
    }
    return res.json();
  },

  // --- Categories ---
  async getCategories(shopId: string): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories/shop/${shopId}`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create category' }));
      throw new Error(err.error || 'Failed to create category');
    }
    return res.json();
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },

  async deleteCategory(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return true;
  },

  // --- Foods ---
  async getFoods(shopId: string): Promise<FoodItem[]> {
    const res = await fetch(`${API_BASE}/foods/shop/${shopId}`);
    if (!res.ok) throw new Error('Failed to fetch foods');
    return res.json();
  },

  async createFood(data: Partial<FoodItem>): Promise<FoodItem> {
    const res = await fetch(`${API_BASE}/foods`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create food item' }));
      throw new Error(err.error || 'Failed to create food item');
    }
    return res.json();
  },

  async updateFood(id: string, updates: Partial<FoodItem>): Promise<FoodItem> {
    const res = await fetch(`${API_BASE}/foods/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update food item' }));
      throw new Error(err.error || 'Failed to update food item');
    }
    return res.json();
  },

  async toggleFoodAvailability(id: string, isAvailable?: boolean): Promise<FoodItem> {
    const res = await fetch(`${API_BASE}/foods/${id}/availability`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isAvailable }),
    });
    if (!res.ok) throw new Error('Failed to update availability');
    return res.json();
  },

  async toggleFoodSpecial(id: string, isFeatured?: boolean): Promise<FoodItem> {
    const res = await fetch(`${API_BASE}/foods/${id}/special`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ isFeatured }),
    });
    if (!res.ok) throw new Error('Failed to update special status');
    return res.json();
  },

  async deleteFood(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/foods/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete food item');
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
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to place order' }));
      throw new Error(err.error || 'Failed to place order');
    }
    return res.json();
  },

  async getOrders(shopId: string): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/orders/shop/${shopId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async trackOrder(orderId: string): Promise<{ order: Order; shop: Partial<Shop> | null }> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/track`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },

  // --- QR Code ---
  async getQRCode(slug: string): Promise<{ slug: string; shopName: string; targetUrl: string; qrDataUrl: string; qrSvg: string }> {
    const res = await fetch(`${API_BASE}/qr/generate/${slug}`);
    if (!res.ok) throw new Error('Failed to generate QR code');
    return res.json();
  },

  // --- Reset demo data ---
  async resetSeed(): Promise<void> {
    await fetch(`${API_BASE}/seed/reset`, { method: 'POST' });
  },
};
