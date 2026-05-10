import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-[200px] flex items-center justify-center select-none">🌍</div>
        <Link to="/landing" className="flex items-center gap-2 relative z-10">
          <span className="text-3xl">✈️</span>
          <span className="text-2xl font-bold text-white">Traveloop</span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Your next adventure<br />starts here.
          </h2>
          <p className="text-indigo-100 text-lg">Plan smarter. Travel better. Remember everything.</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { icon: '🗺️', text: 'Smart Itineraries' },
              { icon: '💰', text: 'Budget Tracking' },
              { icon: '🧳', text: 'Packing Lists' },
              { icon: '📔', text: 'Travel Journal' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <span>{icon}</span>
                <span className="text-white text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-200 text-sm relative z-10">© {new Date().getFullYear()} Traveloop</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-bold text-gradient">Traveloop</span>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Sign in to continue planning your adventures.</p>

          {error && (
            <div className="flex items-center gap-2 text-red-700 text-sm mb-5 bg-red-50 border border-red-200 p-3 rounded-xl">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" placeholder="rahul@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input w-full" required />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition">
                  Forgot password?
                </Link>
              </div>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input w-full" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign In →'}
            </button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-500">
            No account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-800 font-semibold">Create one free</Link>
          </p>
          <p className="text-sm text-center mt-2 text-gray-400">
            <Link to="/landing" className="hover:text-indigo-600 transition">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
