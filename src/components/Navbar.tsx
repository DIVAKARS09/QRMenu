import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, QrCode, Store, LayoutDashboard, LogOut, User as UserIcon, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { api } from '../services/api';

export function Navbar() {
  const { user, shop, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    if (confirm('Reset sample demo database to default roadside food shops seed?')) {
      try {
        setIsResetting(true);
        await api.resetSeed();
        alert('Database restored with fresh sample menus!');
        window.location.reload();
      } catch (err) {
        alert('Failed to reset seed');
      } finally {
        setIsResetting(false);
      }
    }
  };

  const isMenuPage = location.pathname.startsWith('/menu/');
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-orange-200 group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-slate-800">ScanMenu</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                  Food Truck
                </span>
              </div>
              <p className="text-xs text-slate-500 -mt-0.5 hidden sm:block">QR Digital Menu Platform</p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
            <Link
              to="/menu/annapoorna-food-truck"
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                location.pathname === '/menu/annapoorna-food-truck'
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4 text-orange-500" />
              Annapoorna Menu
            </Link>

            <Link
              to="/menu/street-bites-food-truck"
              className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${
                location.pathname === '/menu/street-bites-food-truck'
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4 text-orange-500" />
              Street Bites Menu
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              disabled={isResetting}
              title="Reset Demo Data"
              className="text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin"
                  className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-sm ${
                    isAdminPage
                      ? 'bg-slate-900 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Owner Dashboard</span>
                  <span className="sm:hidden">Dashboard</span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    navigate('/admin/login');
                  }}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/login"
                  className="text-sm font-semibold text-slate-700 hover:text-orange-600 px-3.5 py-2 rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-1.5"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Owner Sign In</span>
                </Link>
                <Link
                  to="/admin/register"
                  className="hidden sm:inline-flex text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl shadow-lg shadow-orange-200 transition-all items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Get QR Menu</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
