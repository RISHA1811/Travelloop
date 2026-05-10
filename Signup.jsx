import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      const { data } = await api.post('/auth/signup', form);
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-[200px] flex items-center justify-center select-none">✈️</div>
        <Link to="/landing" className="flex items-center gap-2 relative z-10">
          <span className="text-3xl">✈️</span>
          <span className="text-2xl font-bold text-white">Traveloop</span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            Join 50,000+<br />happy travelers.
          </h2>
          <p className="text-indigo-100 text-lg">Free forever. No credit card needed.</p>
          <div className="mt-8 space-y-3">
            {[
              '✓ Unlimited trip planning',
              '✓ Budget tracking & alerts',
              '✓ Packing lists & journal',
              '✓ Share trips with friends',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white text-sm font-medium">
                {item}
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

          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500 mb-8">Start planning your dream trips today — it's free.</p>

          {error && (
            <div className="flex items-center gap-2 text-red-700 text-sm mb-5 bg-red-50 border border-red-200 p-3 rounded-xl">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input placeholder="Rahul Sharma" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input w-full" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" placeholder="rahul@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input w-full" required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input w-full" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base mt-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Create Account →'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
          <p className="text-sm text-center mt-4 text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">Sign in</Link>
          </p>
          <p className="text-sm text-center mt-2 text-gray-400">
            <Link to="/landing" className="hover:text-indigo-600 transition">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
