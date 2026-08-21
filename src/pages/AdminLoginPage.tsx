import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, Lock, Mail, ArrowRight, Store, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please provide both email and password');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-amber-50/50 via-white to-orange-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-600 flex items-center justify-center text-white mx-auto shadow-md shadow-orange-500/20">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-950 tracking-tight">Shop Owner Portal</h1>
          <p className="text-xs text-gray-500">Sign in to manage your digital menu, prices & live orders.</p>
        </div>

        {/* 1-Click Quick Demo Login Shortcuts */}
        <div className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>1-Click Test Demo Logins:</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('owner@annapoorna.com')}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-orange-100/80 text-orange-900 border border-orange-200 text-[11px] font-bold text-left transition-colors shadow-2xs"
            >
              🚚 Annapoorna Truck
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('karthik@streetbites.com')}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-orange-100/80 text-orange-900 border border-orange-200 text-[11px] font-bold text-left transition-colors shadow-2xs"
            >
              🍔 Street Bites Stall
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="owner@foodtruck.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Signing In...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-gray-100 text-center space-y-2">
          <p className="text-xs text-gray-500">
            Don't have a digital menu yet?{' '}
            <Link to="/admin/register" className="font-bold text-orange-600 hover:underline">
              Create New Food Truck
            </Link>
          </p>
          <Link to="/" className="inline-block text-[11px] text-gray-400 hover:text-gray-600">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
