import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import TripCard from '../components/TripCard';
import { useAuth } from '../context/AuthContext';

function getTripStatus(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!startDate) return 'upcoming';
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
}

export default function Dashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  const fetchTrips = async () => {
    try {
      const { data } = await api.get('/trips');
      setTrips(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this trip?')) return;
    await api.delete(`/trips/${id}`);
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const totalBudget = trips.reduce((s, t) => s + (t.budget?.reduce((a, b) => a + b.cost, 0) || 0), 0);
  const upcoming = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'upcoming').length;
  const ongoing = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'ongoing').length;
  const completed = trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'completed').length;

  const filtered = trips.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || getTripStatus(t.startDate, t.endDate) === filter;
    return matchSearch && matchFilter;
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">

        {/* Welcome header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {greeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 mt-1">
              {trips.length === 0
                ? "Let's plan your first adventure!"
                : `You have ${trips.length} trip${trips.length !== 1 ? 's' : ''} planned.`}
            </p>
          </div>
          <Link to="/create" className="btn-primary whitespace-nowrap flex items-center gap-2">
            <span>+</span> New Trip
          </Link>
        </div>

        {/* Stats Bar */}
        {trips.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Total Trips', value: trips.length, icon: '🗺️', color: 'bg-indigo-50 text-indigo-700 border border-indigo-100' },
              { label: 'Upcoming', value: upcoming, icon: '🕐', color: 'bg-blue-50 text-blue-700 border border-blue-100' },
              { label: 'Ongoing', value: ongoing, icon: '🚀', color: 'bg-green-50 text-green-700 border border-green-100' },
              { label: 'Total Spent', value: `$${totalBudget.toFixed(0)}`, icon: '💰', color: 'bg-amber-50 text-amber-700 border border-amber-100' },
            ].map((s) => (
              <div key={s.label} className={`${s.color} rounded-2xl p-4 flex items-center gap-3 shadow-sm`}>
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-xl font-bold leading-tight">{s.value}</p>
                  <p className="text-xs opacity-70 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search & Filter */}
        {trips.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search trips..."
              className="input flex-1"
            />
            <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
              {['all', 'upcoming', 'ongoing', 'completed'].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition ${filter === f ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-6xl mb-4">🗺️</p>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No trips yet</h3>
            <p className="text-gray-500 mb-6">Start planning your next adventure!</p>
            <Link to="/create" className="btn-primary inline-flex items-center gap-2">
              <span>+</span> Create Your First Trip
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-medium">No trips match your search.</p>
            <button onClick={() => { setSearch(''); setFilter('all'); }} className="text-indigo-600 text-sm mt-2 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-3">{filtered.length} trip{filtered.length !== 1 ? 's' : ''} shown</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
