import { User, Shop, Category, FoodItem, Order, OrderStatus, PublicShopData, AuthResponse } from '../types';
import { defaultShops, defaultCategories, defaultFoods, defaultUsers } from './mockData';

const LOCAL_STORAGE_PREFIX = 'scanmenu_eatandfly_v5_';

function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    if (!item) {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    const parsed = JSON.parse(item);
    if (Array.isArray(defaultValue) && (!Array.isArray(parsed) || parsed.length === 0)) {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return parsed;
  } catch {
    return defaultValue;
  }
}

function setLocalData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
}

export const localDb = {
  getShops(): Shop[] {
    const data = getLocalData<Shop[]>('shops', defaultShops);
    if (!Array.isArray(data) || data.length === 0) {
      setLocalData('shops', defaultShops);
      return defaultShops;
    }
    return data;
  },
  saveShops(shops: Shop[]) {
    setLocalData('shops', Array.isArray(shops) && shops.length > 0 ? shops : defaultShops);
  },
  getCategories(): Category[] {
    const data = getLocalData<Category[]>('categories', defaultCategories);
    if (!Array.isArray(data) || data.length === 0) {
      setLocalData('categories', defaultCategories);
      return defaultCategories;
    }
    return data;
  },
  saveCategories(cats: Category[]) {
    setLocalData('categories', Array.isArray(cats) && cats.length > 0 ? cats : defaultCategories);
  },
  getFoods(): FoodItem[] {
    const data = getLocalData<FoodItem[]>('foods', defaultFoods);
    if (!Array.isArray(data) || data.length === 0) {
      setLocalData('foods', defaultFoods);
      return defaultFoods;
    }
    return data;
  },
  saveFoods(foods: FoodItem[]) {
    setLocalData('foods', Array.isArray(foods) && foods.length > 0 ? foods : defaultFoods);
  },
  getOrders(): Order[] {
    return getLocalData<Order[]>('orders', []);
  },
  saveOrders(orders: Order[]) {
    setLocalData('orders', orders);
  },
  getUsers(): User[] {
    return getLocalData<User[]>('users', defaultUsers);
  },
  saveUsers(users: User[]) {
    setLocalData('users', users);
  },
  resetAll() {
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'shops');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'categories');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'foods');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'orders');
    localStorage.removeItem(LOCAL_STORAGE_PREFIX + 'users');
  },
};
