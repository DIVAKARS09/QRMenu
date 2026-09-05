import { User, Shop, Category, FoodItem, Order, OrderStatus, PublicShopData, AuthResponse } from '../types';
import { defaultShops, defaultCategories, defaultFoods, defaultUsers } from './mockData';

const LOCAL_STORAGE_PREFIX = 'scanmenu_eatandfly_v4_';

function getLocalData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    if (!item) {
      localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
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
    return getLocalData<Shop[]>('shops', defaultShops);
  },
  saveShops(shops: Shop[]) {
    setLocalData('shops', shops);
  },
  getCategories(): Category[] {
    return getLocalData<Category[]>('categories', defaultCategories);
  },
  saveCategories(cats: Category[]) {
    setLocalData('categories', cats);
  },
  getFoods(): FoodItem[] {
    return getLocalData<FoodItem[]>('foods', defaultFoods);
  },
  saveFoods(foods: FoodItem[]) {
    setLocalData('foods', foods);
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
