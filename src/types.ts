export type UserRole = 'owner' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  _id: string;
  ownerId: string;
  name: string;
  slug: string;
  logo: string;
  coverImage: string;
  description: string;
  phone: string;
  whatsappNumber?: string;
  address: string;
  location: string;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  currency: string;
  qrCodeUrl?: string;
  orderingEnabled: boolean;
  whatsappOrderingEnabled?: boolean;
  upiId?: string;
  customTagline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  shopId: string;
  name: string;
  description?: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  _id: string;
  shopId: string;
  categoryId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  isVegetarian: boolean;
  isAvailable: boolean;
  isFeatured: boolean; // Today's Special
  preparationTime?: string; // e.g. "10-15 mins"
  displayOrder: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';

export interface OrderItem {
  foodItemId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  isVegetarian?: boolean;
}

export interface Order {
  _id: string;
  shopId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: OrderStatus;
  orderNumber: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export interface PublicShopData {
  shop: Shop;
  categories: Category[];
  foods: FoodItem[];
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
  shop?: Shop;
}
