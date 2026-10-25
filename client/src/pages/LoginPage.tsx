import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Smart EMS</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your enterprise workspace</p>
          </div>

          {error && (
            <div className="mb-6 flex items-start space-x-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartems.local"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Quick Fill / Demo Accounts Helper */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
              Quick Fill Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@smartems.local', 'Admin@Secure2026!')}
                className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-md text-xs font-medium transition text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('hr@smartems.local', 'Hr@Secure2026!')}
                className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-md text-xs font-medium transition text-center"
              >
                HR Mgr
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('emp@smartems.local', 'Emp@Secure2026!')}
                className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-md text-xs font-medium transition text-center"
              >
                Employee
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
