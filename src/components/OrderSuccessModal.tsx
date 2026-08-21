import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Utensils, Phone, X, Sparkles, ChefHat } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order, Shop, OrderStatus } from '../types';
import { api } from '../services/api';

interface OrderSuccessModalProps {
  order: Order | null;
  shop: Shop;
  onClose: () => void;
}

export function OrderSuccessModal({ order, shop, onClose }: OrderSuccessModalProps) {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order);

  useEffect(() => {
    if (order) {
      setCurrentOrder(order);
      // Trigger festive celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ea580c', '#f59e0b', '#10b981'],
      });
    }
  }, [order]);

  // Poll for order status updates every 5 seconds while open
  useEffect(() => {
    if (!order) return;
    const interval = setInterval(async () => {
      try {
        const data = await api.trackOrder(order._id);
        if (data && data.order) {
          setCurrentOrder(data.order);
        }
      } catch (err) {
        // silent polling catch
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [order]);

  if (!currentOrder) return null;

  const steps: { status: OrderStatus; label: string; desc: string }[] = [
    { status: 'Pending', label: 'Order Sent', desc: 'Received at shop counter' },
    { status: 'Accepted', label: 'Accepted', desc: 'Shop confirmed order' },
    { status: 'Preparing', label: 'Preparing', desc: 'Cooking on hot tawa/wok' },
    { status: 'Ready', label: 'Ready for Pickup', desc: 'Collect at food truck counter' },
    { status: 'Completed', label: 'Served', desc: 'Enjoy your hot meal!' },
  ];

  const statusOrder: OrderStatus[] = ['Pending', 'Accepted', 'Preparing', 'Ready', 'Completed'];
  const currentStatusIndex = statusOrder.indexOf(currentOrder.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 bg-white text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-white/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold uppercase tracking-wider backdrop-blur-xs mb-1">
            <Sparkles className="w-3 h-3" />
            Order #{currentOrder.orderNumber}
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">Order Placed Successfully!</h2>
          <p className="text-xs text-orange-100 mt-1 max-w-xs mx-auto">
            Your hot street food order has been sent to <span className="font-bold underline">{shop.name}</span>.
          </p>
        </div>

        {/* Scrollable Order Details & Live Stepper */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Real-Time Live Status Stepper */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Live Cooking Status</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  currentOrder.status === 'Ready'
                    ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                    : currentOrder.status === 'Preparing'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {currentOrder.status}
              </span>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {steps.map((step, idx) => {
                const isPassed = currentStatusIndex >= idx;
                const isCurrent = currentOrder.status === step.status;

                return (
                  <div key={step.status} className="relative flex items-start gap-3 text-left">
                    <span
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                        isPassed
                          ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </span>
                    <div>
                      <p className={`text-xs font-bold ${isCurrent ? 'text-orange-600' : isPassed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      <p className="text-[11px] text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Items Summary */}
          <div className="border border-gray-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
              <span>Order Summary</span>
              <span>Total: {shop.currency}{currentOrder.total}</span>
            </div>

            <div className="divide-y divide-gray-100">
              {currentOrder.items.map((it, idx) => (
                <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-gray-800">
                    {it.name} <span className="text-gray-400 font-normal">× {it.quantity}</span>
                  </span>
                  <span className="font-bold text-gray-900">
                    {shop.currency}
                    {it.total}
                  </span>
                </div>
              ))}
            </div>

            {currentOrder.notes && (
              <div className="pt-2 border-t border-gray-100 text-xs text-gray-600">
                <span className="font-bold text-gray-700">Note:</span> {currentOrder.notes}
              </div>
            )}
          </div>

          {/* Shop Location & Call Support */}
          <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-amber-950">{shop.name}</p>
              <p className="text-[11px] text-amber-800">{shop.address}, {shop.location}</p>
            </div>
            {shop.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Shop</span>
              </a>
            )}
          </div>
        </div>

        {/* Footer Close / Done */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-black text-white font-bold text-xs transition-colors shadow-sm"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
