import { createContext, useContext, useState, ReactNode } from 'react';
import { FoodItem, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  shopId: string | null;
  setShopContext: (shopId: string) => void;
  addItem: (food: FoodItem, quantity?: number) => void;
  removeItem: (foodId: string) => void;
  updateQuantity: (foodId: string, delta: number) => void;
  setItemQuantity: (foodId: string, quantity: number) => void;
  getItemQuantity: (foodId: string) => number;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shopId, setShopId] = useState<string | null>(null);

  const setShopContext = (newShopId: string) => {
    if (shopId && shopId !== newShopId) {
      // Clear cart if switching shops
      setCart([]);
    }
    setShopId(newShopId);
  };

  const addItem = (food: FoodItem, quantity: number = 1) => {
    if (!food.isAvailable) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.food._id === food._id);
      if (existing) {
        return prev.map((item) =>
          item.food._id === food._id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { food, quantity }];
    });
  };

  const removeItem = (foodId: string) => {
    setCart((prev) => prev.filter((item) => item.food._id !== foodId));
  };

  const updateQuantity = (foodId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.food._id === foodId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const setItemQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(foodId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.food._id === foodId ? { ...item, quantity } : item))
    );
  };

  const getItemQuantity = (foodId: string): number => {
    const item = cart.find((i) => i.food._id === foodId);
    return item ? item.quantity : 0;
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        shopId,
        setShopContext,
        addItem,
        removeItem,
        updateQuantity,
        setItemQuantity,
        getItemQuantity,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
