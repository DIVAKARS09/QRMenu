import { useState, useEffect } from 'react';
import { X, Plus, Minus, Clock, Flame, ShoppingBag, Check } from 'lucide-react';
import { FoodItem } from '../types';
import { VegBadge } from './VegBadge';
import { useCart } from '../context/CartContext';

interface FoodDetailModalProps {
  food: FoodItem | null;
  currency?: string;
  onClose: () => void;
  orderingEnabled?: boolean;
}

export function FoodDetailModal({
  food,
  currency = '₹',
  onClose,
  orderingEnabled = true,
}: FoodDetailModalProps) {
  const { getItemQuantity, addItem, setItemQuantity } = useCart();
  const [qty, setQty] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  useEffect(() => {
    if (food) {
      const currentInCart = getItemQuantity(food._id);
      setQty(currentInCart > 0 ? currentInCart : 1);
    }
  }, [food]);

  if (!food) return null;

  const handleAddToCart = () => {
    if (!food.isAvailable) return;
    setItemQuantity(food._id, qty);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet Box */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-950/50 hover:bg-slate-950/70 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Food Hero Image */}
        <div className="relative w-full h-56 sm:h-64 bg-slate-900 shrink-0">
          <img
            src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'}
            alt={food.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-white/95 backdrop-blur-xs shadow-md">
                <VegBadge isVeg={food.isVegetarian} size="md" />
              </span>

              {food.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500 text-white shadow-md">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Today's Special</span>
                </span>
              )}
            </div>

            {food.preparationTime && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
                <Clock className="w-3.5 h-3.5" />
                <span>{food.preparationTime}</span>
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {food.name}
              </h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-500 mt-0.5">
                {food.isVegetarian ? 'Vegetarian Dish' : 'Non-Vegetarian Dish'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                <span className="text-base text-slate-500 font-bold mr-0.5">{currency}</span>
                {food.price}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {food.description || 'Prepared fresh on order at our roadside kitchen using traditional spices and high-heat flame wok.'}
          </p>

          {/* Availability notice */}
          {!food.isAvailable && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              Currently Sold Out. Please ask the chef for tomorrow's batch!
            </div>
          )}

          {/* Tags */}
          {food.tags && food.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {food.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {orderingEnabled && food.isAvailable && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs">
              <button
                onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-9 text-center font-bold text-slate-900 text-sm">{qty}</span>
              <button
                onClick={() => setQty((prev) => prev + 1)}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-700 font-bold transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Order CTA */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] ${
                addedAnimation
                  ? 'bg-emerald-600 shadow-emerald-500/30'
                  : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>Added to Order!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>
                    Add to Order • {currency}
                    {food.price * qty}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
