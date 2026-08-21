import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Shop } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  shop: Shop | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateShopState: (shop: Shop) => void;
  refreshShop: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('scanmenu_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        setUser(data.user);
        if (data.shop) {
          setShop(data.shop);
        }
      } catch (err) {
        console.warn('Session expired or invalid token');
        localStorage.removeItem('scanmenu_token');
        setToken(null);
        setUser(null);
        setShop(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const data = await api.login(email, pass);
    localStorage.setItem('scanmenu_token', data.token);
    setToken(data.token);
    setUser(data.user as User);
    if (data.shop) {
      setShop(data.shop);
    }
  };

  const register = async (regData: any) => {
    const data = await api.register(regData);
    localStorage.setItem('scanmenu_token', data.token);
    setToken(data.token);
    setUser(data.user as User);
    if (data.shop) {
      setShop(data.shop);
    }
  };

  const logout = () => {
    localStorage.removeItem('scanmenu_token');
    setToken(null);
    setUser(null);
    setShop(null);
  };

  const updateShopState = (updatedShop: Shop) => {
    setShop(updatedShop);
  };

  const refreshShop = async () => {
    if (!token) return;
    try {
      const data = await api.getMe();
      if (data.shop) {
        setShop(data.shop);
      }
    } catch (err) {
      console.error('Failed to refresh shop data', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        shop,
        token,
        isLoading,
        login,
        register,
        logout,
        updateShopState,
        refreshShop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
