import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Shop, Category, FoodItem, Order, OrderStatus } from '../src/types';

export interface DBState {
  users: User[];
  shops: Shop[];
  categories: Category[];
  foods: FoodItem[];
  orders: Order[];
  nextOrderNumber: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'scanmenu_db.json');

// Initial realistic seed data for roadside 4-wheel food shops
export const getInitialSeedData = (): DBState => {
  const hashedPassword = bcrypt.hashSync('demo1234', 10);
  const now = new Date().toISOString();

  const owner1: User = {
    _id: 'user-annapoorna',
    name: 'Murugan Swaminathan',
    email: 'owner@annapoorna.com',
    phone: '+91 98421 87654',
    password: hashedPassword,
    role: 'owner',
    createdAt: now,
    updatedAt: now,
  };

  const owner2: User = {
    _id: 'user-streetbites',
    name: 'Karthik Raja',
    email: 'karthik@streetbites.com',
    phone: '+91 97500 12345',
    password: hashedPassword,
    role: 'owner',
    createdAt: now,
    updatedAt: now,
  };

  const shop1: Shop = {
    _id: 'shop-annapoorna',
    ownerId: owner1._id,
    name: 'Annapoorna Food Truck',
    slug: 'annapoorna-food-truck',
    logo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
    description: 'Authentic roadside hot bites, tawa fried rice, sizzling rolls & signature chillers freshly prepared in our 4-wheel mobile kitchen.',
    phone: '+91 98421 87654',
    whatsappNumber: '+919842187654',
    address: 'Near Central Bus Stand, Brough Road',
    location: 'Erode, Tamil Nadu',
    openingTime: '05:30 PM',
    closingTime: '11:30 PM',
    isOpen: true,
    currency: '₹',
    orderingEnabled: true,
    whatsappOrderingEnabled: true,
    upiId: 'annapoornafood@upi',
    customTagline: 'Fresh & Hot From Our Food Truck Right To You!',
    createdAt: now,
    updatedAt: now,
  };

  const shop2: Shop = {
    _id: 'shop-streetbites',
    ownerId: owner2._id,
    name: 'Street Bites Food Truck',
    slug: 'street-bites-food-truck',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop&q=80',
    description: 'Crispy street snacks, loaded kathi rolls, shawarma & refreshing fresh juices on wheels.',
    phone: '+91 97500 12345',
    whatsappNumber: '+919750012345',
    address: 'Opposite VOC Park Ground, Gandhiji Road',
    location: 'Erode, Tamil Nadu',
    openingTime: '04:00 PM',
    closingTime: '11:00 PM',
    isOpen: true,
    currency: '₹',
    orderingEnabled: true,
    whatsappOrderingEnabled: true,
    upiId: 'streetbites@okhdfcbank',
    customTagline: 'Scan • Explore • Savor the crunch',
    createdAt: now,
    updatedAt: now,
  };

  // Categories for Shop 1 (Annapoorna Food Truck)
  const cat1: Category = { _id: 'cat-special', shopId: shop1._id, name: "Today's Special", description: "Chef's daily hot recommendations", displayOrder: 1, isActive: true, createdAt: now, updatedAt: now };
  const cat2: Category = { _id: 'cat-rice', shopId: shop1._id, name: "Rice & Noodles", description: "Hot tossed wok dishes on flame", displayOrder: 2, isActive: true, createdAt: now, updatedAt: now };
  const cat3: Category = { _id: 'cat-rolls', shopId: shop1._id, name: "Rolls & Wraps", description: "Crispy tawa parotta rolls", displayOrder: 3, isActive: true, createdAt: now, updatedAt: now };
  const cat4: Category = { _id: 'cat-snacks', shopId: shop1._id, name: "Starters & Snacks", description: "Deep fried & tossed evening munchies", displayOrder: 4, isActive: true, createdAt: now, updatedAt: now };
  const cat5: Category = { _id: 'cat-beverages', shopId: shop1._id, name: "Beverages & Juices", description: "Freshly squeezed & refreshing drinks", displayOrder: 5, isActive: true, createdAt: now, updatedAt: now };
  const cat6: Category = { _id: 'cat-desserts', shopId: shop1._id, name: "Sweet Treats", description: "Quick sweet finishers", displayOrder: 6, isActive: true, createdAt: now, updatedAt: now };

  const categories: Category[] = [cat1, cat2, cat3, cat4, cat5, cat6];

  // Food Items for Shop 1
  const foods: FoodItem[] = [
    {
      _id: 'food-1',
      shopId: shop1._id,
      categoryId: cat2._id,
      name: 'Chicken Fried Rice',
      description: 'Aromatic basmati rice tossed with tender shredded chicken, spring onions, eggs, and freshly cracked pepper in our signature food truck wok style.',
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
      price: 130,
      isVegetarian: false,
      isAvailable: true,
      isFeatured: true,
      preparationTime: '8-10 mins',
      displayOrder: 1,
      tags: ['Bestseller', 'Hot'],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'food-2',
      shopId: shop1._id,
      categoryId: cat2._id,
      name: 'Schezwan Egg Noodles',
      description: 'Spicy wok tossed noodles with scrambled farm eggs, crunchy capsicum, cabbage, and homemade spicy Schezwan sauce.',
      image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
      price: 110,
      isVegetarian: false,
      isAvailable: true,
      isFeatured: false,
      preparationTime: '7-9 mins',
      displayOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'food-3',
      shopId: shop1._id,
      categoryId: cat2._id,
      name: 'Veg Hakka Noodles',
      description: 'Classic mild-spiced wheat noodles with julienned carrots, beans, baby corn, and toasted garlic.',
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
      price: 90,
      isVegetarian: true,
      isAvailable: true,
      isFeatured: false,
      preparationTime: '6-8 mins',
      displayOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'food-4',
      shopId: shop1._id,
      categoryId: cat3._id,
      name: 'Double Egg Chicken Roll',
      description: 'Flaky layered tawa paratha lined with double farm eggs, stuffed with spicy tandoori diced chicken, sliced onions, and mint mayo.',
      image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
      price: 120,
      isVegetarian: false,
      isAvailable: true,
      isFeatured: true,
      preparationTime: '5-7 mins',
      displayOrder: 4,
      tags: ['Must Try'],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'food-5',
      shopId: shop1._id,
      categoryId: cat3._id,
      name: 'Crispy Paneer Tikka Roll',
      description: 'Marinated cottage cheese cubes grilled on tawa, wrapped with crispy onions, chaat masala, and green chutney.',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80',
      price: 100,
      isVegetarian: true,
      isAvailable: true,
      isFeatured: false,
      preparationTime: '5-7 mins',
      displayOrder: 5,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'food-6',
      shopId: shop1._id,
      categoryId: cat4._id,
      name: 'Chicken 65 (Crispy Street Style)',
      description: '10 pieces of bite-sized boneless chicken marinated in curd, curry leaves, ginger-garlic, and South Indian spices, fried golden crisp.',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
      price: 140,
      isVegetarian: false,
      isAvailable: true,
      isFeatured: true,
      preparationTime: '8-10 mins',
      displayOrder: 6,
      tags: ['Crowd Favorite'],
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'food-7',
      shopId: shop1._id,
      categoryId: cat4._id,
      name: 'Peri Peri French Fries',
      description: 'Crispy thick-cut potato fries tossed in spicy tangy African peri peri seasoning served with garlic dip.',
      image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
      price: 80,
      isVegetarian: true,
      isAvailable: true,
      isFeatured: false,
      preparationTime: '5 mins',
      displayOrder: 7,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'food-8',
      shopId: shop1._id,
      categoryId: cat4._id,
      name: 'Chilli Paneer Dry',
      description: 'Crispy battered paneer cubes wok tossed with green chilies, bell peppers, soya glaze, and toasted sesame.',
      image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80',
      price: 110,
      isVegetarian: true,
      isAvailable: false, // Demo of currently unavailable item
      isFeatured: false,
      preparationTime: '8 mins',
      displayOrder: 8,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'food-9',
      shopId: shop1._id,
      categoryId: cat5._id,
      name: 'Fresh Mint Lime Soda',
      description: 'Chilled club soda infused with fresh squeezed lime juice, hand-crushed garden mint, rock salt, and sweet syrup.',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      price: 50,
      isVegetarian: true,
      isAvailable: true,
      isFeatured: false,
      preparationTime: '3 mins',
      displayOrder: 9,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'food-10',
      shopId: shop1._id,
      categoryId: cat5._id,
      name: 'Kullad Filter Coffee',
      description: 'Authentic Kumbakonam degree decoction filter coffee brewed with thick cows milk in an earthen clay pot.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
      price: 30,
      isVegetarian: true,
      isAvailable: true,
      isFeatured: true,
      preparationTime: '2 mins',
      displayOrder: 10,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'food-11',
      shopId: shop1._id,
      categoryId: cat5._id,
      name: 'Masala Ginger Chai',
      description: 'Strong roadside cutting chai with crushed ginger, cardamom, and fresh holy basil.',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
      price: 20,
      isVegetarian: true,
      isAvailable: true,
      isFeatured: false,
      preparationTime: '2 mins',
      displayOrder: 11,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: 'food-12',
      shopId: shop1._id,
      categoryId: cat6._id,
      name: 'Hot Gulab Jamun with Ice Cream',
      description: '2 soft khoya dumplings soaked in rose cardamom sugar syrup, served piping hot with a scoop of vanilla ice cream.',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      price: 70,
      isVegetarian: true,
      isAvailable: true,
      isFeatured: false,
      preparationTime: '3 mins',
      displayOrder: 12,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Initial Sample Orders
  const orders: Order[] = [
    {
      _id: 'order-1001',
      shopId: shop1._id,
      customerName: 'Praveen Kumar',
      customerPhone: '9840123987',
      items: [
        { foodItemId: 'food-1', name: 'Chicken Fried Rice', quantity: 2, price: 130, total: 260, isVegetarian: false },
        { foodItemId: 'food-4', name: 'Double Egg Chicken Roll', quantity: 1, price: 120, total: 120, isVegetarian: false },
        { foodItemId: 'food-9', name: 'Fresh Mint Lime Soda', quantity: 2, price: 50, total: 100, isVegetarian: true },
      ],
      subtotal: 480,
      total: 480,
      status: 'Ready',
      orderNumber: 1021,
      notes: 'Make it extra spicy with onion slices.',
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      _id: 'order-1002',
      shopId: shop1._id,
      customerName: 'Ananya Ramesh',
      customerPhone: '9944512340',
      items: [
        { foodItemId: 'food-6', name: 'Chicken 65 (Crispy Street Style)', quantity: 1, price: 140, total: 140, isVegetarian: false },
        { foodItemId: 'food-2', name: 'Schezwan Egg Noodles', quantity: 1, price: 110, total: 110, isVegetarian: false },
      ],
      subtotal: 250,
      total: 250,
      status: 'Preparing',
      orderNumber: 1022,
      notes: 'Less oil please.',
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
    },
    {
      _id: 'order-1003',
      shopId: shop1._id,
      customerName: 'Suresh Babu',
      customerPhone: '9843211223',
      items: [
        { foodItemId: 'food-5', name: 'Crispy Paneer Tikka Roll', quantity: 2, price: 100, total: 200, isVegetarian: true },
        { foodItemId: 'food-10', name: 'Kullad Filter Coffee', quantity: 2, price: 30, total: 60, isVegetarian: true },
      ],
      subtotal: 260,
      total: 260,
      status: 'Pending',
      orderNumber: 1023,
      notes: 'Takeaway pack.',
      createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 60000).toISOString(),
    },
  ];

  return {
    users: [owner1, owner2],
    shops: [shop1, shop2],
    categories,
    foods,
    orders,
    nextOrderNumber: 1024,
  };
};

class StoreService {
  private state: DBState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DBState {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read DB file, using in-memory seed:', err);
    }
    const initial = getInitialSeedData();
    this.saveStateDirect(initial);
    return initial;
  }

  private saveStateDirect(state: DBState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not write DB file:', err);
    }
  }

  private saveState() {
    this.saveStateDirect(this.state);
  }

  public resetToSeed(): DBState {
    this.state = getInitialSeedData();
    this.saveState();
    return this.state;
  }

  // --- Users ---
  public findUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.state.users.find((u) => u._id === id);
  }

  public createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): User {
    const now = new Date().toISOString();
    const newUser: User = {
      _id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...userData,
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

  public findShopBySlug(slug: string): Shop | undefined {
    return this.state.shops.find((s) => s.slug.toLowerCase() === slug.toLowerCase());
  }

  public findShopById(id: string): Shop | undefined {
    return this.state.shops.find((s) => s._id === id);
  }

  public findShopByOwnerId(ownerId: string): Shop | undefined {
    return this.state.shops.find((s) => s.ownerId === ownerId);
  }

  public createShop(shopData: Omit<Shop, '_id' | 'createdAt' | 'updatedAt'>): Shop {
    const now = new Date().toISOString();
    const newShop: Shop = {
      _id: `shop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...shopData,
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

  public createCategory(catData: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Category {
    const now = new Date().toISOString();
    const newCat: Category = {
      _id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...catData,
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
    const initialLen = this.state.categories.length;
    this.state.categories = this.state.categories.filter((c) => c._id !== id);
    // Also reassign or delete foods in that category, or keep them uncategorized
    if (this.state.categories.length !== initialLen) {
      this.saveState();
      return true;
    }
    return false;
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

  public createFood(foodData: Omit<FoodItem, '_id' | 'createdAt' | 'updatedAt'>): FoodItem {
    const now = new Date().toISOString();
    const newFood: FoodItem = {
      _id: `food-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...foodData,
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
    const initialLen = this.state.foods.length;
    this.state.foods = this.state.foods.filter((f) => f._id !== id);
    if (this.state.foods.length !== initialLen) {
      this.saveState();
      return true;
    }
    return false;
  }

  public toggleFoodAvailability(id: string, isAvailable?: boolean): FoodItem | undefined {
    const food = this.getFoodById(id);
    if (!food) return undefined;
    const newStatus = isAvailable !== undefined ? isAvailable : !food.isAvailable;
    return this.updateFood(id, { isAvailable: newStatus });
  }

  public toggleFoodFeatured(id: string, isFeatured?: boolean): FoodItem | undefined {
    const food = this.getFoodById(id);
    if (!food) return undefined;
    const newFeatured = isFeatured !== undefined ? isFeatured : !food.isFeatured;
    return this.updateFood(id, { isFeatured: newFeatured });
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
