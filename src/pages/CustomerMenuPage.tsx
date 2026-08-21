import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Search,
  Phone,
  Share2,
  Clock,
  MapPin,
  Flame,
  ShoppingBag,
  ArrowRight,
  UtensilsCrossed,
  Check,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Shop, Category, FoodItem, Order } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { FoodCard } from '../components/FoodCard';
import { FoodDetailModal } from '../components/FoodDetailModal';
import { CartDrawer } from '../components/CartDrawer';
import { OrderSuccessModal } from '../components/OrderSuccessModal';
import { MenuSkeleton } from '../components/SkeletonLoader';

export function CustomerMenuPage() {
  const { shopSlug } = useParams<{ shopSlug: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Filtering & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Modals & Drawers
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const { setShopContext, itemCount, subtotal } = useCart();

  useEffect(() => {
    async function loadMenu() {
      if (!shopSlug) return;
      try {
        setIsLoading(true);
        setErrorMsg('');
        const data = await api.getPublicShopMenu(shopSlug);
        setShop(data.shop);
        setCategories(data.categories || []);
        setFoods(data.foods || []);
        setShopContext(data.shop._id);
      } catch (err: any) {
        console.error('Failed to load menu:', err);
        setErrorMsg(err.message || 'Shop Not Found');
      } finally {
        setIsLoading(false);
      }
    }
    loadMenu();
  }, [shopSlug]);

  // Featured Today's Specials
  const featuredFoods = useMemo(() => {
    return foods.filter((f) => f.isFeatured && f.isAvailable);
  }, [foods]);

  // Filtered Foods
  const filteredFoods = useMemo(() => {
    return foods.filter((f) => {
      // Category filter
      if (selectedCategory === 'specials') {
        if (!f.isFeatured) return false;
      } else if (selectedCategory !== 'all') {
        if (f.categoryId !== selectedCategory) return false;
      }

      // Veg / Non-Veg filter
      if (dietFilter === 'veg' && !f.isVegetarian) return false;
      if (dietFilter === 'non-veg' && f.isVegetarian) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesDesc = f.description.toLowerCase().includes(q);
        const matchesTags = f.tags ? f.tags.some((t) => t.toLowerCase().includes(q)) : false;
        if (!matchesName && !matchesDesc && !matchesTags) return false;
      }

      return true;
    });
  }, [foods, selectedCategory, dietFilter, searchQuery]);

  const handleShareMenu = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shop?.name || 'Digital Food Menu',
          text: `Check out the fresh digital menu for ${shop?.name}!`,
          url: shareUrl,
        });
      } catch (err) {
        // user cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (err) {
        prompt('Copy menu link:', shareUrl);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <MenuSkeleton />
      </div>
    );
  }

  if (errorMsg || !shop) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Shop Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This digital menu may no longer be active, or the QR link was entered incorrectly.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/"
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-md shadow-orange-200 transition-colors"
            >
              Browse Active Food Trucks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-sans">
      {/* Top Shop Cover & Header */}
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Cover Image */}
        <div className="relative h-44 sm:h-64 w-full bg-slate-900 overflow-hidden sm:rounded-b-3xl">
          <img
            src={shop.coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

          {/* Top Quick Actions (Call / Share) */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={handleShareMenu}
              className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors shadow-xs"
              title="Share Menu"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {shop.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200 transition-colors"
                title="Call Shop"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Shop Info Overlay Card */}
        <div className="px-4 -mt-14 sm:-mt-16 relative z-10">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start gap-4">
              {/* Circular / Rounded Logo */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-500 p-0.5 shadow-md shadow-orange-200 shrink-0 overflow-hidden border-2 border-white">
                <img
                  src={shop.logo || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&auto=format&fit=crop&q=80'}
                  alt={shop.name}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>

              {/* Title & Status */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug truncate">
                    {shop.name}
                  </h1>

                  {shop.isOpen ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Open Now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700 border border-red-200">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Closed Now
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {shop.description || 'Authentic roadside hot bites freshly prepared in our 4-wheel kitchen.'}
                </p>
              </div>
            </div>

            {/* Location & Timings Metadata */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500 flex-wrap">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="truncate">{shop.address}, {shop.location}</span>
              </div>

              <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{shop.openingTime} - {shop.closingTime}</span>
              </div>
            </div>

            {/* Shop closed warning banner */}
            {!shop.isOpen && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>The food truck is currently closed. You can explore the menu, but ordering is paused.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Today's Special Highlights */}
        {featuredFoods.length > 0 && selectedCategory === 'all' && !searchQuery && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-lg bg-orange-100 text-orange-600">
                  <Flame className="w-4 h-4 fill-current" />
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Today's Specials</h2>
              </div>
              <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                Fresh From Tawa
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {featuredFoods.slice(0, 4).map((food) => (
                <FoodCard
                  key={`feat-${food._id}`}
                  food={food}
                  currency={shop.currency}
                  orderingEnabled={shop.orderingEnabled && shop.isOpen}
                  onSelect={(f) => setSelectedFood(f)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Menu Header & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Explore Menu</h2>
              <p className="text-xs text-slate-500">Freshly prepared hot food on order</p>
            </div>

            {/* Live Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food... e.g. Chicken, Fries"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Horizontally Scrollable Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              All Items ({foods.length})
            </button>

            {featuredFoods.length > 0 && (
              <button
                onClick={() => setSelectedCategory('specials')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 ${
                  selectedCategory === 'specials'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-current text-orange-500" />
                <span>Today's Special ({featuredFoods.length})</span>
              </button>
            )}

            {categories.map((cat) => {
              const count = foods.filter((f) => f.categoryId === cat._id).length;
              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat._id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat._id
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.name} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>

          {/* Veg / Non-Veg Quick Dietary Chips */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">Diet:</span>

            <button
              onClick={() => setDietFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                dietFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>

            <button
              onClick={() => setDietFilter('veg')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                dietFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Veg Only</span>
            </button>

            <button
              onClick={() => setDietFilter('non-veg')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                dietFilter === 'non-veg'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>Non-Veg Only</span>
            </button>
          </div>
        </div>

        {/* Food Items Display Grid */}
        {filteredFoods.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Food Found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              We couldn't find any dish matching your filter. Try clearing your search or switching categories.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setDietFilter('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                currency={shop.currency}
                orderingEnabled={shop.orderingEnabled && shop.isOpen}
                onSelect={(f) => setSelectedFood(f)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Sticky Bottom Cart Action Bar */}
      {shop.orderingEnabled && itemCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-xl shadow-orange-300 flex items-center justify-between hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span>
                {itemCount} {itemCount === 1 ? 'Item' : 'Items'} • {shop.currency}
                {subtotal}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold bg-white/20 px-3 py-1 rounded-xl">
              <span>View Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Food Detail Modal */}
      <FoodDetailModal
        food={selectedFood}
        currency={shop.currency}
        orderingEnabled={shop.orderingEnabled && shop.isOpen}
        onClose={() => setSelectedFood(null)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        shop={shop}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={(order) => setActiveOrder(order)}
      />

      {/* Order Placed Success & Live Tracking Modal */}
      <OrderSuccessModal
        order={activeOrder}
        shop={shop}
        onClose={() => setActiveOrder(null)}
      />
    </div>
  );
}
