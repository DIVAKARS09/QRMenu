import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Shop, Category, FoodItem, Order, OrderStatus } from '../src/types';
import { defaultUsers, defaultShops, defaultCategories, defaultFoods } from '../src/services/mockData';

export interface DBState {
  users: User[];
  shops: Shop[];
  categories: Category[];
  foods: FoodItem[];
  orders: Order[];
  nextOrderNumber: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'scanmenu_db_v4.json');

export const getInitialSeedData = (): DBState => {
  const hashedPassword = bcrypt.hashSync('demo1234', 10);
  const usersWithPasswords = defaultUsers.map((u) => ({
    ...u,
    password: hashedPassword,
  }));

  return {
    users: usersWithPasswords,
    shops: defaultShops,
    categories: defaultCategories,
    foods: defaultFoods,
    orders: [],
    nextOrderNumber: 101,
  };
};

class StoreService {
  private state: DBState;

  constructor() {
    this.ensureDataDirectory();
    this.state = this.loadState();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadState(): DBState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed && Array.isArray(parsed.shops) && parsed.shops.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading database file, initializing with seed data', err);
    }
    const seed = getInitialSeedData();
    this.saveStateDirect(seed);
    return seed;
  }

  private saveState() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database state', err);
    }
  }

  private saveStateDirect(state: DBState) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist initial database state', err);
    }
  }

  public resetToSeed(): DBState {
    const seed = getInitialSeedData();
    this.state = seed;
    this.saveState();
    return seed;
  }

  // --- Users ---
  public getUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  public findUserByEmail(email: string): User | undefined {
    return this.getUserByEmail(email);
  }

  public getUserById(id: string): User | undefined {
    return this.state.users.find((u) => u._id === id);
  }
  public findUserById(id: string): User | undefined {
    return this.getUserById(id);
  }

  public createUser(userData: Partial<User>): User {
    const now = new Date().toISOString();
    const newUser: User = {
      _id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: userData.name || 'Food Truck Owner',
      email: (userData.email || '').toLowerCase(),
      password: userData.password ? bcrypt.hashSync(userData.password, 10) : '',
      phone: userData.phone || '',
      role: 'owner',
      createdAt: now,
      updatedAt: now,
    };
    this.state.users.push(newUser);
    this.saveState();
    return newUser;
  }

  // --- Shops ---
  public getAllShops(): Shop[] {
    return this.state.shops;
  }

  public getShopById(id: string): Shop | undefined {
    return this.state.shops.find((s) => s._id === id);
  }
  public findShopById(id: string): Shop | undefined {
    return this.getShopById(id);
  }

  public getShopBySlug(slug: string): Shop | undefined {
    const cleanSlug = (slug || '').toLowerCase().trim();
    return this.state.shops.find((s) => s.slug.toLowerCase() === cleanSlug || s._id === cleanSlug);
  }
  public findShopBySlug(slug: string): Shop | undefined {
    return this.getShopBySlug(slug);
  }

  public getShopByOwnerId(ownerId: string): Shop | undefined {
    return this.state.shops.find((s) => s.ownerId === ownerId);
  }
  public findShopByOwnerId(ownerId: string): Shop | undefined {
    return this.getShopByOwnerId(ownerId);
  }

  public createShop(shopData: Partial<Shop>, ownerId?: string): Shop {
    const now = new Date().toISOString();
    const cleanOwnerId = ownerId || shopData.ownerId || 'user-eatandfly';
    const slug = (shopData.slug || shopData.name || 'food-truck')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newShop: Shop = {
      _id: `shop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ownerId: cleanOwnerId,
      name: shopData.name || 'Eat & Fly',
      slug: slug || `shop-${Date.now()}`,
      logo: shopData.logo || 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&auto=format&fit=crop&q=80',
      coverImage: shopData.coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
      description: shopData.description || 'GOOD FOOD | GOOD LIFE',
      phone: shopData.phone || '',
      whatsappNumber: shopData.whatsappNumber || shopData.phone || '',
      address: shopData.address || 'Food Truck Hub',
      location: shopData.location || 'City Hub',
      openingTime: shopData.openingTime || '04:00 PM',
      closingTime: shopData.closingTime || '11:30 PM',
      isOpen: shopData.isOpen !== undefined ? shopData.isOpen : true,
      currency: shopData.currency || '₹',
      orderingEnabled: shopData.orderingEnabled !== undefined ? shopData.orderingEnabled : true,
      whatsappOrderingEnabled: shopData.whatsappOrderingEnabled !== undefined ? shopData.whatsappOrderingEnabled : true,
      upiId: shopData.upiId || '',
      customTagline: shopData.customTagline || 'GOOD FOOD | GOOD LIFE',
      createdAt: now,
      updatedAt: now,
    };
    this.state.shops.push(newShop);
    this.saveState();
    return newShop;
  }

  public updateShop(id: string, updates: Partial<Shop>): Shop | undefined {
    const index = this.state.shops.findIndex((s) => s._id === id);
    if (index === -1) return undefined;
    this.state.shops[index] = {
      ...this.state.shops[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
    return this.state.shops[index];
  }

  // --- Categories ---
  public getCategoriesByShopId(shopId: string): Category[] {
    return this.state.categories
      .filter((c) => c.shopId === shopId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getCategoryById(id: string): Category | undefined {
    return this.state.categories.find((c) => c._id === id);
  }

  public createCategory(catData: Partial<Category>): Category {
    const now = new Date().toISOString();
    const newCat: Category = {
      _id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      shopId: catData.shopId || '',
      name: catData.name || 'New Category',
      description: catData.description || '',
      displayOrder: catData.displayOrder || this.state.categories.length + 1,
      isActive: catData.isActive !== undefined ? catData.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    this.state.categories.push(newCat);
    this.saveState();
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | undefined {
    const index = this.state.categories.findIndex((c) => c._id === id);
    if (index === -1) return undefined;
    this.state.categories[index] = {
      ...this.state.categories[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
    return this.state.categories[index];
  }

  public deleteCategory(id: string): boolean {
    const prevLen = this.state.categories.length;
    this.state.categories = this.state.categories.filter((c) => c._id !== id);
    this.state.foods = this.state.foods.filter((f) => f.categoryId !== id);
    this.saveState();
    return this.state.categories.length < prevLen;
  }

  // --- Foods ---
  public getFoodsByShopId(shopId: string): FoodItem[] {
    return this.state.foods
      .filter((f) => f.shopId === shopId)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  public getFoodById(id: string): FoodItem | undefined {
    return this.state.foods.find((f) => f._id === id);
  }

  public createFood(foodData: Partial<FoodItem>): FoodItem {
    const now = new Date().toISOString();
    const newFood: FoodItem = {
      _id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      shopId: foodData.shopId || '',
      categoryId: foodData.categoryId || '',
      name: foodData.name || 'New Dish',
      description: foodData.description || '',
      image: foodData.image || 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
      price: Number(foodData.price) || 0,
      isVegetarian: Boolean(foodData.isVegetarian),
      isAvailable: foodData.isAvailable !== undefined ? foodData.isAvailable : true,
      isFeatured: Boolean(foodData.isFeatured),
      preparationTime: foodData.preparationTime || '5-10 mins',
      displayOrder: foodData.displayOrder || this.state.foods.length + 1,
      tags: foodData.tags || [],
      createdAt: now,
      updatedAt: now,
    };
    this.state.foods.push(newFood);
    this.saveState();
    return newFood;
  }

  public updateFood(id: string, updates: Partial<FoodItem>): FoodItem | undefined {
    const index = this.state.foods.findIndex((f) => f._id === id);
    if (index === -1) return undefined;
    this.state.foods[index] = {
      ...this.state.foods[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
    return this.state.foods[index];
  }

  public deleteFood(id: string): boolean {
    const prevLen = this.state.foods.length;
    this.state.foods = this.state.foods.filter((f) => f._id !== id);
    this.saveState();
    return this.state.foods.length < prevLen;
  }

  public toggleFoodAvailability(id: string, isAvailable?: boolean): FoodItem | undefined {
    const food = this.getFoodById(id);
    if (!food) return undefined;
    const newAvail = isAvailable !== undefined ? isAvailable : !food.isAvailable;
    return this.updateFood(id, { isAvailable: newAvail });
  }

  public toggleFoodSpecial(id: string, isFeatured?: boolean): FoodItem | undefined {
    const food = this.getFoodById(id);
    if (!food) return undefined;
    const newFeatured = isFeatured !== undefined ? isFeatured : !food.isFeatured;
    return this.updateFood(id, { isFeatured: newFeatured });
  }

  public toggleFoodFeatured(id: string, isFeatured?: boolean): FoodItem | undefined {
    return this.toggleFoodSpecial(id, isFeatured);
  }

  // --- Orders ---
  public getOrdersByShopId(shopId: string): Order[] {
    return this.state.orders
      .filter((o) => o.shopId === shopId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrderById(id: string): Order | undefined {
    return this.state.orders.find((o) => o._id === id);
  }

  public createOrder(orderData: {
    shopId: string;
    customerName: string;
    customerPhone: string;
    items: Order['items'];
    notes?: string;
  }): Order {
    const now = new Date().toISOString();
    const subtotal = orderData.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const orderNumber = this.state.nextOrderNumber++;

    const newOrder: Order = {
      _id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      shopId: orderData.shopId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      items: orderData.items,
      subtotal,
      total: subtotal,
      status: 'Pending',
      orderNumber,
      notes: orderData.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    this.state.orders.unshift(newOrder);
    this.saveState();
    return newOrder;
  }

  public updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
    const index = this.state.orders.findIndex((o) => o._id === id);
    if (index === -1) return undefined;
    this.state.orders[index] = {
      ...this.state.orders[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.saveState();
    return this.state.orders[index];
  }
}

export const dbStore = new StoreService();
