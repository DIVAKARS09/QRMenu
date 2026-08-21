import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  QrCode,
  UtensilsCrossed,
  ArrowRight,
  Flame,
  CheckCircle,
  Clock,
  Sparkles,
  Smartphone,
  Store,
  ChevronRight,
  Printer,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Shop } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [activeShopSlug, setActiveShopSlug] = useState('annapoorna-food-truck');
  const [demoQRUrl, setDemoQRUrl] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getAllShops()
      .then((data) => {
        setShops(data);
        if (data.length > 0) {
          setActiveShopSlug(data[0].slug);
        }
      })
      .catch((err) => console.error('Failed to load shops', err));
  }, []);

  const menuUrl = `${window.location.origin}/menu/${activeShopSlug}`;

  useEffect(() => {
    QRCode.toDataURL(menuUrl, {
      width: 400,
      margin: 1,
      color: { dark: '#111827', light: '#FFFFFF' },
    }).then((url) => setDemoQRUrl(url));
  }, [menuUrl]);

  const handleQuickDemoLogin = async (email: string) => {
    try {
      await login(email, 'demo1234');
      navigate('/admin');
    } catch (err) {
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs font-bold tracking-wide shadow-xs">
                <Flame className="w-4 h-4 text-orange-500 fill-current" />
                <span>BUILT FOR ROADSIDE 4-WHEEL FOOD SHOPS & FOOD TRUCKS</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Turn your food truck into a{' '}
                <span className="text-orange-500">
                  Digital Menu
                </span>{' '}
                with one QR code.
              </h1>

              {/* Tagline / Problem-Solution */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Stop answering <span className="font-semibold text-slate-900">"What food do you have?"</span> and{' '}
                <span className="font-semibold text-slate-900">"How much is chicken rice?"</span> 50 times an hour.
                Customers scan the QR code, see live photos & today's specials, and order with ease.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to={`/menu/${activeShopSlug}`}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Open Customer Menu Preview</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/admin/login"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Store className="w-4 h-4 text-orange-500" />
                  <span>Owner Dashboard Sign In</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>No App Install Required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Instant Availability Toggle</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Thermal / A4 Print Ready</span>
                </div>
              </div>
            </div>

            {/* Right Interactive QR & Mobile Simulator Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Standee
                    </span>
                  </div>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                    Scan & Test
                  </span>
                </div>

                {/* Shop Selector Dropdown inside simulation */}
                <div className="mt-4">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Select Shop to Demo:
                  </label>
                  <select
                    value={activeShopSlug}
                    onChange={(e) => setActiveShopSlug(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                  >
                    {shops.map((s) => (
                      <option key={s._id} value={s.slug}>
                        {s.name} ({s.location})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Interactive QR Display */}
                <div className="my-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                    {demoQRUrl ? (
                      <img src={demoQRUrl} alt="Menu QR Code" className="w-44 h-44 object-contain" />
                    ) : (
                      <div className="w-44 h-44 bg-slate-100 animate-pulse flex items-center justify-center text-xs text-slate-400">
                        Generating QR...
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs font-bold text-slate-800">Scan with your smartphone camera</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">or click below to open directly</p>
                </div>

                {/* Quick Link Button */}
                <Link
                  to={`/menu/${activeShopSlug}`}
                  className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-colors"
                >
                  <span>Open Digital Menu in Browser</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before vs After Scenario Comparison */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600">The Problem & The Fix</h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Why Roadside Food Trucks Love ScanMenu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Before Card */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold uppercase">
                ❌ Traditional Verbal Order (Slow & Repeated)
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Customer: <strong className="text-slate-900">"Anna, what food do you have?"</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Owner stops cooking to verbally list 20 items again and again.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Customer asks price of each dish individually, creating a long queue.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Paper menus get stained by oil, water, and weather.</span>
                </li>
              </ul>
            </div>

            {/* After Card */}
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase border border-emerald-200">
                ✅ With ScanMenu QR Digital Menu
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Customer points smartphone camera at the counter standee QR code.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Menu instantly opens with appetizing food photos, prices, and Today's Specials.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>1-click sold out switch ensures customers never order exhausted items.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span>Owner focuses 100% on fast, sizzling cooking and customer satisfaction.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Live Demo Shops */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600">Sample Live Food Stalls</h2>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">Explore Roadside Menu Demos</p>
            </div>
            <Link
              to="/admin/register"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>Create Your Own Food Truck Menu</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shops.map((shop) => (
              <div
                key={shop._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row"
              >
                <div className="sm:w-48 h-44 sm:h-auto bg-slate-100 relative shrink-0">
                  <img src={shop.coverImage} alt={shop.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 p-1 rounded-xl bg-white shadow-sm">
                    <img src={shop.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-base text-slate-900">{shop.name}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Open Now
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{shop.description}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-2">📍 {shop.address}, {shop.location}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/menu/${shop.slug}`}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>View Menu</span>
                    </Link>

                    <button
                      onClick={() => handleQuickDemoLogin(shop._id === 'shop-annapoorna' ? 'owner@annapoorna.com' : 'karthik@streetbites.com')}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-colors"
                    >
                      Login as Owner
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights for Food Truck Owners */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600">Core Capabilities</h2>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Everything a Food Truck Owner Needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Dynamic QR Standee Poster</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download or print customized QR poster cards formatted for your counter, stall glass, or thermal printer.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Today's Special Manager</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Highlight special daily dishes at the top of your menu with one tap to boost sales during peak hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">1-Click Sold Out Toggle</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When an ingredient runs out, toggle it off instantly so customers never order items you can't prepare.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Live Order Queue</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Optional order management with live status steps: Pending → Accepted → Cooking → Ready for Pickup.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">WhatsApp Order Integration</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive itemized orders straight to your WhatsApp with preformatted dish names, quantities, and totals.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Fast Mobile Experience</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Super lightweight, mobile-optimized design loads under 1 second even on spotty roadside connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-white py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-base">
              S
            </div>
            <div>
              <p className="font-bold text-sm">ScanMenu</p>
              <p className="text-xs text-slate-400">QR Digital Menus for Roadside 4-Wheel Food Shops</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link to="/menu/annapoorna-food-truck" className="hover:text-white transition-colors">
              Annapoorna Food Truck
            </Link>
            <Link to="/menu/street-bites-food-truck" className="hover:text-white transition-colors">
              Street Bites
            </Link>
            <Link to="/admin/login" className="hover:text-white transition-colors">
              Owner Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
