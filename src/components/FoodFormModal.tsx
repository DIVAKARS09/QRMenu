import { useState, useEffect, FormEvent } from 'react';
import { X, Flame, Clock, Sparkles, Image as ImageIcon, Check } from 'lucide-react';
import { FoodItem, Category } from '../types';

interface FoodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (foodData: Partial<FoodItem>) => Promise<void>;
  categories: Category[];
  initialData?: FoodItem | null;
}

const IMAGE_PRESETS = [
  { label: 'Fried Rice', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80' },
  { label: 'Noodles', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80' },
  { label: 'Egg/Chicken Roll', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80' },
  { label: 'Paneer Wrap', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80' },
  { label: 'Chicken 65', url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80' },
  { label: 'French Fries', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80' },
  { label: 'Fresh Juice', url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Filter Coffee / Chai', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Dessert / Sweets', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80' },
];

export function FoodFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData,
}: FoodFormModalProps) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [preparationTime, setPreparationTime] = useState('5-10 mins');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCategoryId(initialData.categoryId || (categories[0]?._id ?? ''));
      setDescription(initialData.description || '');
      setPrice(String(initialData.price || ''));
      setImage(initialData.image || '');
      setIsVegetarian(Boolean(initialData.isVegetarian));
      setIsAvailable(initialData.isAvailable !== undefined ? initialData.isAvailable : true);
      setIsFeatured(Boolean(initialData.isFeatured));
      setPreparationTime(initialData.preparationTime || '5-10 mins');
      setTagsInput(initialData.tags ? initialData.tags.join(', ') : '');
    } else {
      setName('');
      setCategoryId(categories[0]?._id || '');
      setDescription('');
      setPrice('');
      setImage(IMAGE_PRESETS[0].url);
      setIsVegetarian(false);
      setIsAvailable(true);
      setIsFeatured(false);
      setPreparationTime('5-8 mins');
      setTagsInput('Hot');
    }
    setErrorMsg('');
  }, [initialData, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Food item name is required');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Please select a category');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMsg('Please enter a valid price');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSubmit({
        name: name.trim(),
        categoryId,
        description: description.trim(),
        price: numPrice,
        image: image || IMAGE_PRESETS[0].url,
        isVegetarian,
        isAvailable,
        isFeatured,
        preparationTime: preparationTime.trim(),
        tags,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save food item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
          <div>
            <h2 className="font-black text-gray-900 text-lg sm:text-xl">
              {initialData ? 'Edit Food Item' : 'Add New Food Item'}
            </h2>
            <p className="text-xs text-gray-500">
              Instantly visible on your public QR menu after saving.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Food Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Food Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chicken Fried Rice"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                placeholder="e.g. 130"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="e.g. Freshly tossed with shredded chicken, eggs, and spring onion on hot wok."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Preparation Time */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Preparation Time</label>
              <input
                type="text"
                placeholder="e.g. 5-8 mins"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Bestseller, Must Try, Spicy"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Veg / Non-Veg Toggle */}
            <div className="p-3 rounded-2xl border border-gray-200 bg-gray-50/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Food Type</span>
                <span className="text-[11px] text-gray-500">
                  {isVegetarian ? '🟢 Pure Vegetarian' : '🔴 Non-Vegetarian'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsVegetarian(!isVegetarian)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  isVegetarian
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {isVegetarian ? 'Veg' : 'Non-Veg'}
              </button>
            </div>

            {/* Availability Toggle */}
            <div className="p-3 rounded-2xl border border-gray-200 bg-gray-50/70 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">In Stock / Available</span>
                <span className="text-[11px] text-gray-500">
                  {isAvailable ? '✅ Ready to order' : '❌ Mark as Sold Out'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  isAvailable
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {isAvailable ? 'Available' : 'Sold Out'}
              </button>
            </div>

            {/* Today's Special Toggle */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-amber-950 block">Mark as Today's Special</span>
                  <span className="text-[11px] text-amber-800">
                    Highlighted at the top of customer menu to boost sales today.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors ${
                  isFeatured
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-300'
                }`}
              >
                {isFeatured ? '🔥 Featured' : 'Standard'}
              </button>
            </div>

            {/* Image URL & Preset Selection */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Food Image URL or Quick Select Preset
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Quick Image Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Presets:</span>
                {IMAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                      image === preset.url
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md shadow-orange-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Food Item' : 'Add Food Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
