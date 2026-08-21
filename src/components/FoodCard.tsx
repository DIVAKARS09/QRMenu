import { useState, MouseEvent } from 'react';
import { Plus, Minus, Flame, Clock, Eye } from 'lucide-react';
import { FoodItem } from '../types';
import { VegBadge } from './VegBadge';
import { useCart } from '../context/CartContext';

interface FoodCardProps {
  food: FoodItem;
  currency?: string;
  onSelect?: (food: FoodItem) => void;
  orderingEnabled?: boolean;
}

export function FoodCard({ food, currency = '₹', onSelect, orderingEnabled = true }: FoodCardProps) {
  const { getItemQuantity, addItem, updateQuantity } = useCart();
  const quantity = getItemQuantity(food._id);
  const [imageError, setImageError] = useState(false);

  const fallbackImage =
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

  const handleAddClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (!food.isAvailable) return;
    addItem(food, 1);
  };

  const handleDecrement = (e: MouseEvent) => {
    e.stopPropagation();
    updateQuantity(food._id, -1);
  };

  const handleIncrement = (e: MouseEvent) => {
    e.stopPropagation();
    if (!food.isAvailable) return;
    updateQuantity(food._id, 1);
  };

  return (
    <div
      onClick={() => onSelect && onSelect(food)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col cursor-pointer ${
        food.isAvailable
          ? 'border-slate-200 shadow-xs hover:shadow-md hover:border-orange-300'
          : 'border-slate-200 bg-slate-50/70 opacity-75'
      }`}
    >
      {/* Top Image Section */}
      <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={imageError || !food.image ? fallbackImage : food.image}
          alt={food.name}
          onError={() => setImageError(true)}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            !food.isAvailable ? 'grayscale-[60%]' : ''
          }`}
        />

        {/* Top Badges overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="p-1 rounded-md bg-white/95 backdrop-blur-xs shadow-xs">
              <VegBadge isVeg={food.isVegetarian} size="sm" />
            </span>

            {food.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500 text-white shadow-xs">
                <Flame className="w-3 h-3 fill-current" />
                <span>Special</span>
              </span>
            )}
          </div>

          {food.preparationTime && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/60 text-white backdrop-blur-xs">
              <Clock className="w-2.5 h-2.5" />
              <span>{food.preparationTime}</span>
            </span>
          )}
        </div>

        {/* Unavailable overlay ribbon */}
        {!food.isAvailable && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center p-2">
            <span className="px-3 py-1 rounded-full bg-red-600/90 text-white font-bold text-xs uppercase tracking-wider shadow-md">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-orange-500 transition-colors line-clamp-1">
              {food.name}
            </h3>
          </div>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {food.description || 'Freshly prepared hot roadside delicacy.'}
          </p>
        </div>

        {/* Price & Action */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-slate-500 font-medium">{currency}</span>
            <span className="text-lg font-bold text-slate-900">{food.price}</span>
          </div>

          {orderingEnabled ? (
            food.isAvailable ? (
              quantity > 0 ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center bg-orange-500 text-white rounded-lg p-0.5 shadow-sm shadow-orange-200"
                >
                  <button
                    onClick={handleDecrement}
                    className="w-7 h-7 flex items-center justify-center hover:bg-orange-600 rounded-md transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="w-7 h-7 flex items-center justify-center hover:bg-orange-600 rounded-md transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddClick}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-500 text-orange-600 hover:text-white font-semibold text-xs flex items-center gap-1 border border-orange-200 hover:border-orange-500 transition-all shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD</span>
                </button>
              )
            ) : (
              <span className="text-[11px] font-medium text-slate-400 italic">Sold Out</span>
            )
          ) : (
            <button
              onClick={() => onSelect && onSelect(food)}
              className="p-1.5 text-slate-400 hover:text-orange-500 rounded-md hover:bg-orange-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
