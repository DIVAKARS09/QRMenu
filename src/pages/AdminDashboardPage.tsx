import { useState, useEffect, useMemo, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  FolderTree,
  ShoppingBag,
  Flame,
  QrCode,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare,
  ExternalLink,
  Search,
  Power,
  Volume2,
  VolumeX,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Store,
  Printer,
  ChevronRight,
  Eye,
  Check,
} from 'lucide-react';
import { Shop, Category, FoodItem, Order, OrderStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { VegBadge } from '../components/VegBadge';
import { FoodFormModal } from '../components/FoodFormModal';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { QRPosterModal } from '../components/QRPosterModal';
import { DashboardSkeleton } from '../components/SkeletonLoader';

type ActiveTab = 'overview' | 'menu' | 'categories' | 'specials' | 'orders' | 'qr' | 'settings';

export function AdminDashboardPage() {
  const { user, shop, isLoading: authLoading, updateShopState, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Filters & Search
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Modals state
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'food' | 'category' | null;
    id: string;
    name: string;
  }>({ isOpen: false, type: null, id: '', name: '' });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<Partial<Shop>>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSavedSuccess, setSettingsSavedSuccess] = useState(false);

  // Sound notifications for incoming orders
  const [soundAlerts, setSoundAlerts] = useState(true);

  // Check auth
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [user, authLoading, navigate]);

  // Load shop data
  const loadShopData = async () => {
    if (!shop) return;
    try {
      setIsDataLoading(true);
      const [catsData, foodsData, ordersData] = await Promise.all([
        api.getCategories(shop._id),
        api.getFoods(shop._id),
        api.getOrders(shop._id),
      ]);
      setCategories(catsData);
      setFoods(foodsData);
      setOrders(ordersData);
      setSettingsForm(shop);
    } catch (err) {
      console.error('Failed to load shop dashboard data', err);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (shop) {
      loadShopData();
    }
  }, [shop?._id]);

  // Poll orders every 7 seconds
  useEffect(() => {
    if (!shop || activeTab !== 'orders' && activeTab !== 'overview') return;
    const interval = setInterval(async () => {
      try {
        const freshOrders = await api.getOrders(shop._id);
        setOrders(freshOrders);
      } catch (err) {
        // silent
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [shop?._id, activeTab]);

  // Quick Open/Close shop status toggle
  const handleToggleShopStatus = async () => {
    if (!shop) return;
    try {
      const updated = await api.updateShop(shop._id, { isOpen: !shop.isOpen });
      updateShopState(updated);
    } catch (err) {
      alert('Failed to update shop status');
    }
  };

  // --- Food Handlers ---
  const handleSaveFood = async (foodData: Partial<FoodItem>) => {
    if (!shop) return;
    if (editingFood) {
      const updated = await api.updateFood(editingFood._id, foodData);
      setFoods((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
    } else {
      const created = await api.createFood({ ...foodData, shopId: shop._id });
      setFoods((prev) => [...prev, created]);
    }
  };

  const handleToggleFoodAvailability = async (foodId: string, current: boolean) => {
    try {
      const updated = await api.toggleFoodAvailability(foodId, !current);
      setFoods((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  const handleToggleFoodSpecial = async (foodId: string, current: boolean) => {
    try {
      const updated = await api.toggleFoodSpecial(foodId, !current);
      setFoods((prev) => prev.map((f) => (f._id === updated._id ? updated : f)));
    } catch (err) {
      alert('Failed to update featured status');
    }
  };

  const handleDeleteFoodConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.deleteFood(deleteConfirm.id);
      setFoods((prev) => prev.filter((f) => f._id !== deleteConfirm.id));
      setDeleteConfirm({ isOpen: false, type: null, id: '', name: '' });
    } catch (err) {
      alert('Failed to delete food item');
    }
  };

  // --- Category Handlers ---
  const handleSaveCategory = async (catData: Partial<Category>) => {
    if (!shop) return;
    if (editingCat) {
      const updated = await api.updateCategory(editingCat._id, catData);
      setCategories((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    } else {
      const created = await api.createCategory({ ...catData, shopId: shop._id });
      setCategories((prev) => [...prev, created]);
    }
  };

  const handleDeleteCategoryConfirm = async () => {
    if (!deleteConfirm.id) return;
    try {
      await api.deleteCategory(deleteConfirm.id);
      setCategories((prev) => prev.filter((c) => c._id !== deleteConfirm.id));
      setDeleteConfirm({ isOpen: false, type: null, id: '', name: '' });
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  // --- Order Status Advancement ---
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  // --- Settings Form Submit ---
  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    try {
      setIsSavingSettings(true);
      const updated = await api.updateShop(shop._id, settingsForm);
      updateShopState(updated);
      setSettingsSavedSuccess(true);
      setTimeout(() => setSettingsSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save shop settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Computed Metrics
  const stats = useMemo(() => {
    const totalFoods = foods.length;
    const availableFoods = foods.filter((f) => f.isAvailable).length;
    const specialFoods = foods.filter((f) => f.isFeatured).length;
    const todayOrders = orders;
    const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Accepted' || o.status === 'Preparing');
    const totalRevenue = orders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      totalFoods,
      availableFoods,
      specialFoods,
      todayOrdersCount: todayOrders.length,
      pendingOrdersCount: pendingOrders.length,
      totalRevenue,
    };
  }, [foods, orders]);

  // Filtered Foods in Menu Tab
  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      if (selectedCategoryFilter !== 'all' && f.categoryId !== selectedCategoryFilter) return false;
      if (menuSearch.trim()) {
        const q = menuSearch.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesDesc = f.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [foods, selectedCategoryFilter, menuSearch]);

  // Filtered Orders in Orders Tab
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter((o) => o.status.toLowerCase() === orderStatusFilter.toLowerCase());
  }, [orders, orderStatusFilter]);

  if (authLoading || (isDataLoading && !shop)) {
    return <DashboardSkeleton />;
  }

  if (!shop) return null;

  const publicMenuUrl = `/menu/${shop.slug}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Shop Control Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 p-0.5 shadow-sm shadow-orange-200 overflow-hidden shrink-0">
              <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover rounded-[10px]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">{shop.name}</h1>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                  /{shop.slug}
                </span>
              </div>
              <p className="text-xs text-slate-500">{shop.address}, {shop.location}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Live Open / Closed Switch */}
            <button
              onClick={handleToggleShopStatus}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                shop.isOpen
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{shop.isOpen ? '🟢 Shop Open' : '🔴 Shop Closed'}</span>
            </button>

            {/* Preview Public Menu Link */}
            <a
              href={publicMenuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200"
            >
              <Eye className="w-3.5 h-3.5 text-orange-500" />
              <span>Customer View</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Quick QR Print CTA */}
            <button
              onClick={() => setActiveTab('qr')}
              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-orange-500" />
              <span>QR Standee</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'menu' ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Food Menu ({foods.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'categories' ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('specials')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'specials' ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' : 'text-orange-900 hover:bg-orange-50'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Today's Specials ({stats.specialFoods})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors relative ${
              activeTab === 'orders' ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Live Orders</span>
            {stats.pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                {stats.pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'qr' ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Standee</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === 'settings' ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Shop Settings</span>
          </button>
        </div>

        {/* --- TAB 1: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Today's Orders</span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.todayOrdersCount}</div>
                <p className="text-[11px] text-orange-600 font-medium">{stats.pendingOrdersCount} active in queue</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Estimated Revenue</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {shop.currency}
                  {stats.totalRevenue}
                </div>
                <p className="text-[11px] text-emerald-600 font-medium">From completed & active orders</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Available Items</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {stats.availableFoods} <span className="text-sm text-slate-400 font-normal">/ {stats.totalFoods}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {stats.totalFoods - stats.availableFoods} marked as sold out
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Today's Specials</span>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">{stats.specialFoods}</div>
                <p className="text-[11px] text-orange-700 font-medium">Featured on top of menu</p>
              </div>
            </div>

            {/* Quick Actions & Recent Orders Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Recent Active Orders */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                  >
                    <span>View All Orders</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">No customer orders placed yet today</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((ord) => (
                      <div key={ord._id} className="py-3.5 flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-orange-500">#{ord.orderNumber}</span>
                            <span className="text-xs font-semibold text-slate-900">{ord.customerName}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                ord.status === 'Ready'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'Preparing'
                                  ? 'bg-amber-100 text-amber-800'
                                  : ord.status === 'Completed'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {ord.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-bold text-xs text-slate-900">
                            {shop.currency}
                            {ord.total}
                          </p>
                          <p className="text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Col: Quick Shortcuts */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900">Quick Controls</h2>

                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setEditingFood(null);
                      setIsFoodModalOpen(true);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-semibold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4 text-orange-500" />
                      Add New Dish / Price
                    </span>
                    <ChevronRight className="w-4 h-4 text-orange-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('specials')}
                    className="w-full py-3 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-xs font-semibold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      Pick Today's Specials
                    </span>
                    <ChevronRight className="w-4 h-4 text-orange-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('qr')}
                    className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-slate-600" />
                      Print Standee for Food Truck
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: FOOD MENU MANAGEMENT --- */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            {/* Header with Search and Add Food CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Manage Food Items</h2>
                <p className="text-xs text-slate-500">
                  Update prices, upload photos, or toggle sold out status with 1-click.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingFood(null);
                  setIsFoodModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-200 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food Item</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search food by name..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-slate-50"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white font-medium text-slate-700"
              >
                <option value="all">All Categories ({foods.length})</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Food Items Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Dish</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">In-Stock Status</th>
                    <th className="py-3 px-4">Today's Special</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFoods.map((food) => {
                    const catName = categories.find((c) => c._id === food.categoryId)?.name || 'General';
                    return (
                      <tr key={food._id} className="hover:bg-slate-50 transition-colors">
                        {/* Food Image & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                              <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <VegBadge isVeg={food.isVegetarian} size="sm" />
                                <span className="font-semibold text-slate-900 text-sm">{food.name}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{food.description}</p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4 text-slate-600 font-medium">{catName}</td>

                        {/* Price */}
                        <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                          {shop.currency}
                          {food.price}
                        </td>

                        {/* Instant Availability Toggle Switch */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleFoodAvailability(food._id, food.isAvailable)}
                            className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-colors ${
                              food.isAvailable
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${food.isAvailable ? 'bg-emerald-600' : 'bg-red-600'}`} />
                            <span>{food.isAvailable ? 'Available' : 'Sold Out'}</span>
                          </button>
                        </td>

                        {/* Instant Today's Special Toggle */}
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleFoodSpecial(food._id, food.isFeatured)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                              food.isFeatured
                                ? 'bg-orange-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <Flame className="w-3 h-3 fill-current" />
                            <span>{food.isFeatured ? 'Special' : 'Standard'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingFood(food);
                                setIsFoodModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                              title="Edit item"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirm({
                                  isOpen: true,
                                  type: 'food',
                                  id: food._id,
                                  name: food.name,
                                })
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: CATEGORIES --- */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Manage Menu Categories</h2>
                <p className="text-xs text-slate-500">
                  Organize dishes into intuitive tabs for customers browsing on mobile.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingCat(null);
                  setIsCatModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-200 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = foods.filter((f) => f.categoryId === cat._id).length;
                return (
                  <div
                    key={cat._id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:border-orange-200 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{cat.name}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800">
                          {count} dishes
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{cat.description || 'Category'}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Display Order: #{cat.displayOrder}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingCat(cat);
                          setIsCatModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            type: 'category',
                            id: cat._id,
                            name: cat.name,
                          })
                        }
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 4: TODAY'S SPECIALS MANAGER --- */}
        {activeTab === 'specials' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 fill-current" />
                Today's Special Hot Recommendations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle items with 1 click to feature them prominently at the top of your public QR menu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {foods.map((food) => (
                <div
                  key={food._id}
                  onClick={() => handleToggleFoodSpecial(food._id, food.isFeatured)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    food.isFeatured
                      ? 'border-orange-500 bg-orange-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <VegBadge isVeg={food.isVegetarian} size="sm" />
                        <span className="font-semibold text-slate-900 text-sm truncate">{food.name}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">
                        {shop.currency}
                        {food.price}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                      food.isFeatured
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {food.isFeatured ? '🔥 Featured' : '+ Feature'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 5: LIVE ORDERS QUEUE --- */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-orange-500" />
                  Live Order Dispatcher
                </h2>
                <p className="text-xs text-slate-500">
                  Manage incoming customer orders in real-time as you cook.
                </p>
              </div>

              {/* Sound alert switch */}
              <button
                onClick={() => setSoundAlerts(!soundAlerts)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto hover:bg-slate-200"
              >
                {soundAlerts ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>{soundAlerts ? 'Alert Sounds On' : 'Muted'}</span>
              </button>
            </div>

            {/* Order status filter tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {['all', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                    orderStatusFilter === st
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Orders Grid */}
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-400 space-y-2">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-800">No Orders in this Status</p>
                <p className="text-xs text-slate-500">Orders placed by customers will automatically appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  return (
                    <div
                      key={order._id}
                      className={`p-5 rounded-2xl border-2 flex flex-col justify-between space-y-4 shadow-xs transition-all ${
                        order.status === 'Ready'
                          ? 'border-emerald-400 bg-emerald-50/40'
                          : order.status === 'Preparing'
                          ? 'border-amber-400 bg-amber-50/40'
                          : order.status === 'Accepted'
                          ? 'border-blue-400 bg-blue-50/40'
                          : order.status === 'Completed'
                          ? 'border-slate-200 bg-slate-50/60 opacity-80'
                          : 'border-orange-400 bg-orange-50/40'
                      }`}
                    >
                      <div>
                        {/* Order Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                          <div>
                            <span className="font-mono text-base font-bold text-orange-500">
                              #{order.orderNumber}
                            </span>
                            <h3 className="font-semibold text-slate-900 text-sm">{order.customerName}</h3>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'Ready'
                                ? 'bg-emerald-600 text-white'
                                : order.status === 'Preparing'
                                ? 'bg-amber-500 text-white'
                                : order.status === 'Accepted'
                                ? 'bg-blue-600 text-white'
                                : order.status === 'Completed'
                                ? 'bg-slate-600 text-white'
                                : 'bg-orange-500 text-white'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        {/* Order Items */}
                        <div className="py-3 space-y-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs font-medium text-slate-800">
                              <span>
                                {item.name} <span className="text-slate-400 font-normal">× {item.quantity}</span>
                              </span>
                              <span>
                                {shop.currency}
                                {item.total}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Customer Phone & Notes */}
                        {order.notes && (
                          <div className="p-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 italic">
                            💬 "{order.notes}"
                          </div>
                        )}

                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                          {order.customerPhone ? (
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="text-orange-500 font-semibold hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{order.customerPhone}</span>
                            </a>
                          ) : (
                            <span>No phone</span>
                          )}
                          <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Total & Action Status Progression */}
                      <div className="pt-3 border-t border-slate-200 space-y-2">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span className="text-xs text-slate-500 font-normal">Total Amount:</span>
                          <span className="text-base">
                            {shop.currency}
                            {order.total}
                          </span>
                        </div>

                        {/* Status Stepper Progression Buttons */}
                        <div className="flex items-center gap-1.5">
                          {order.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, 'Accepted')}
                              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
                            >
                              Accept Order
                            </button>
                          )}

                          {order.status === 'Accepted' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, 'Preparing')}
                              className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs"
                            >
                              Start Cooking
                            </button>
                          )}

                          {order.status === 'Preparing' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, 'Ready')}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs animate-pulse"
                            >
                              Mark Ready for Pickup
                            </button>
                          )}

                          {order.status === 'Ready' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, 'Completed')}
                              className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-xs"
                            >
                              Mark Completed
                            </button>
                          )}

                          {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order._id, 'Cancelled')}
                              className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 font-semibold text-xs transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 6: QR CODE & POSTER STUDIO --- */}
        {activeTab === 'qr' && <QRPosterModal shop={shop} />}

        {/* --- TAB 7: SHOP SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Shop Profile & Settings</h2>
              <p className="text-xs text-slate-500">
                Update your food stall's contact information, location, operating hours, and ordering options.
              </p>
            </div>

            {settingsSavedSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Shop settings updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shop Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Food Truck / Stall Name</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.name || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Menu URL Slug</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.slug || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number for Calls</label>
                  <input
                    type="tel"
                    value={settingsForm.phone || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number for Orders</label>
                  <input
                    type="tel"
                    placeholder="e.g. +919842187654"
                    value={settingsForm.whatsappNumber || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* Address & Landmark */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Stall Landmark / Road</label>
                  <input
                    type="text"
                    value={settingsForm.address || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={settingsForm.location || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* Opening Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 05:00 PM"
                    value={settingsForm.openingTime || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, openingTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* Closing Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Closing Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 11:30 PM"
                    value={settingsForm.closingTime || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, closingTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* Tagline */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Standee Poster Tagline</label>
                  <input
                    type="text"
                    placeholder="e.g. Fresh & Hot From Our Food Truck Right To You!"
                    value={settingsForm.customTagline || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, customTagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shop Description</label>
                  <textarea
                    rows={2}
                    value={settingsForm.description || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* Logo Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Logo Image URL</label>
                  <input
                    type="url"
                    value={settingsForm.logo || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logo: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* Cover Image URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Banner URL</label>
                  <input
                    type="url"
                    value={settingsForm.coverImage || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, coverImage: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-hidden bg-slate-50"
                  />
                </div>

                {/* Ordering Toggles */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Direct In-App Ordering</span>
                    <span className="text-[11px] text-slate-500">Allow customers to submit orders directly</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(settingsForm.orderingEnabled)}
                    onChange={(e) => setSettingsForm({ ...settingsForm, orderingEnabled: e.target.checked })}
                    className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">WhatsApp Order Button</span>
                    <span className="text-[11px] text-slate-500">Allow sending formatted order to your WhatsApp</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(settingsForm.whatsappOrderingEnabled)}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappOrderingEnabled: e.target.checked })}
                    className="w-5 h-5 accent-orange-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-200 disabled:opacity-50 transition-all"
                >
                  {isSavingSettings ? 'Saving Changes...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Food Add / Edit Modal */}
      <FoodFormModal
        isOpen={isFoodModalOpen}
        onClose={() => {
          setIsFoodModalOpen(false);
          setEditingFood(null);
        }}
        onSubmit={handleSaveFood}
        categories={categories}
        initialData={editingFood}
      />

      {/* Category Add / Edit Modal */}
      <CategoryFormModal
        isOpen={isCatModalOpen}
        onClose={() => {
          setIsCatModalOpen(false);
          setEditingCat(null);
        }}
        onSubmit={handleSaveCategory}
        initialData={editingCat}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`Delete ${deleteConfirm.type === 'food' ? 'Food Item' : 'Category'}?`}
        message={`Are you sure you want to permanently delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isDangerous
        onConfirm={deleteConfirm.type === 'food' ? handleDeleteFoodConfirm : handleDeleteCategoryConfirm}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: null, id: '', name: '' })}
      />
    </div>
  );
}
