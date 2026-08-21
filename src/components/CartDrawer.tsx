import { useState, FormEvent } from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, MessageSquare, ShoppingBag, Send, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Shop, Order } from '../types';
import { VegBadge } from './VegBadge';
import { api } from '../services/api';

interface CartDrawerProps {
  shop: Shop;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export function CartDrawer({ shop, isOpen, onClose, onOrderSuccess }: CartDrawerProps) {
  const { cart, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('scanmenu_cust_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('scanmenu_cust_phone') || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePlaceDirectOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('Your order cart is empty');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      // Save customer info locally for faster repeat order experience
      localStorage.setItem('scanmenu_cust_name', customerName.trim());
      if (customerPhone.trim()) {
        localStorage.setItem('scanmenu_cust_phone', customerPhone.trim());
      }

      const orderData = {
        shopId: shop._id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: cart.map((item) => ({
          foodItemId: item.food._id,
          name: item.food.name,
          quantity: item.quantity,
          price: item.food.price,
          total: item.food.price * item.quantity,
          isVegetarian: item.food.isVegetarian,
        })),
        notes: notes.trim(),
      };

      const placedOrder = await api.createOrder(orderData);
      clearCart();
      onClose();
      onOrderSuccess(placedOrder);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!customerName.trim()) {
      setErrorMsg('Please enter your name before ordering via WhatsApp');
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('Your cart is empty');
      return;
    }

    // Format WhatsApp message
    let msg = `*🛒 New Order for ${shop.name}*\n`;
    msg += `*Customer:* ${customerName.trim()}\n`;
    if (customerPhone.trim()) msg += `*Phone:* ${customerPhone.trim()}\n`;
    msg += `---------------------------------\n`;

    cart.forEach((item) => {
      msg += `• ${item.food.name} × ${item.quantity} = ${shop.currency}${item.food.price * item.quantity}\n`;
    });

    msg += `---------------------------------\n`;
    msg += `*Total Amount:* ${shop.currency}${subtotal}\n`;
    if (notes.trim()) {
      msg += `*Note:* ${notes.trim()}\n`;
    }
    msg += `_Sent via ScanMenu QR Digital Menu_`;

    const rawPhone = shop.whatsappNumber || shop.phone || '';
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">Your Order</h2>
              <p className="text-xs text-slate-500 font-medium">{shop.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Your Cart is Empty</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Explore the delicious items on our digital menu and add your favorites to place an order.
              </p>
              <button
                onClick={onClose}
                className="mt-5 px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold text-xs hover:bg-orange-600 transition-colors shadow-xs"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                  <span>Selected Items ({cart.length})</span>
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-600 text-xs font-semibold lowercase flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>clear all</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 bg-slate-50/80 rounded-2xl border border-slate-200 p-2 sm:p-3">
                  {cart.map((item) => (
                    <div key={item.food._id} className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <VegBadge isVeg={item.food.isVegetarian} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.food.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {shop.currency}
                            {item.food.price} each
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                          <button
                            onClick={() => updateQuantity(item.food._id, -1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.food._id, 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="w-14 text-right font-bold text-xs sm:text-sm text-slate-900">
                          {shop.currency}
                          {item.food.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Details Form */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Customer Info</h4>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-slate-400 font-normal">(Optional for updates)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9842187654"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Special Cooking Request</label>
                  <input
                    type="text"
                    placeholder="e.g. Extra spicy, no onions, takeaway pack"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Items Total</span>
                  <span className="font-semibold">
                    {shop.currency}
                    {subtotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Cart Fees</span>
                  <span className="font-semibold text-emerald-600">₹0 (Included)</span>
                </div>
                <div className="pt-2 border-t border-orange-200 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-slate-900">Total Payable</span>
                  <span className="font-bold text-lg text-orange-600">
                    {shop.currency}
                    {subtotal}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  Pay at the counter when you pick up your hot order.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-2.5 shrink-0">
            {/* Direct Instant Order Button */}
            <button
              onClick={handlePlaceDirectOrder}
              disabled={isSubmitting || !shop.isOpen}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-orange-500 hover:bg-orange-600 shadow-sm shadow-orange-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Sending Order to Food Truck...</span>
              ) : (
                <>
                  <span>Place Order • {shop.currency}{subtotal}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Optional WhatsApp Ordering Button */}
            {shop.whatsappOrderingEnabled && (
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Order via WhatsApp ({shop.whatsappNumber || shop.phone})</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
