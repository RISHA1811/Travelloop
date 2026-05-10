import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import TripCard from '../components/TripCard';

function getTripStatus(s, e) {
  const now = new Date();
  if (!s) return 'upcoming';
  if (now < new Date(s)) return 'upcoming';
  if (now > new Date(e)) return 'completed';
  return 'ongoing';
}

const STATUS_BADGE = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
};

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/trips').then(({ data }) => setTrips(data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this trip?')) return;
    await api.delete(`/trips/${id}`);
    setTrips((p) => p.filter((t) => t.id !== id));
  };

  const filtered = trips
    .filter((t) => {
      const q = search.toLowerCase();
      return (
        (t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)) &&
        (filter === 'all' || getTripStatus(t.startDate, t.endDate) === filter)
      );
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'date') return new Date(a.startDate || 0) - new Date(b.startDate || 0);
      return 0;
    });

  const stats = {
    total: trips.length,
    upcoming: trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'upcoming').length,
    ongoing: trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'ongoing').length,
    completed: trips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'completed').length,
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <PageHeader
          title="My Trips"
          subtitle={`${trips.length} trip${trips.length !== 1 ? 's' : ''} in your collection`}
          actions={<Link to="/create" className="btn-primary">+ Create Trip</Link>}
        />

        {/* Status tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[
            { key: 'all', label: `All (${stats.total})` },
            { key: 'upcoming', label: `Upcoming (${stats.upcoming})` },
            { key: 'ongoing', label: `Ongoing (${stats.ongoing})` },
            { key: 'completed', label: `Completed (${stats.completed})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`text-sm px-4 py-1.5 rounded-full font-medium border transition ${filter === key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Search + Sort + View toggle */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search trips..." className="input flex-1 min-w-[200px]" />
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A–Z</option>
            <option value="date">By Start Date</option>
          </select>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            <button onClick={() => setView('grid')} className={`px-3 py-1 rounded-lg text-sm transition ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>⊞ Grid</button>
            <button onClick={() => setView('list')} className={`px-3 py-1 rounded-lg text-sm transition ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>☰ List</button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">Loading...</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow">
            <p className="text-6xl mb-4">🗺️</p>
            <p className="text-gray-500 text-lg font-medium">No trips yet</p>
            <p className="text-gray-400 text-sm mb-5">Start planning your first adventure!</p>
            <Link to="/create" className="btn-primary">Create Your First Trip</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p>No trips match your search.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((trip) => <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((trip) => {
              const status = getTripStatus(trip.startDate, trip.endDate);
              const budget = trip.budget?.reduce((s, b) => s + b.cost, 0) || 0;
              return (
                <div key={trip.id} className="bg-white rounded-2xl shadow p-4 flex items-center gap-4 hover:shadow-md transition">
                  <span className="text-3xl w-12 text-center">{trip.coverEmoji || '✈️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-800">{trip.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[status]}`}>{status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{trip.startDate || '—'} → {trip.endDate || '—'}</p>
                    <p className="text-sm text-gray-500 truncate">{trip.description || 'No description'}</p>
                  </div>
                  <div className="hidden sm:flex gap-4 text-xs text-gray-400">
                    <span>📍 {trip.itinerary?.length || 0}</span>
                    <span>💰 ${budget.toFixed(0)}</span>
                    <span>🧳 {trip.packing?.filter(p => p.packed).length || 0}/{trip.packing?.length || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigate(`/trip/${trip.id}`)} className="btn-primary text-xs px-3 py-1.5">Open</button>
                    <button onClick={() => handleDelete(trip.id)} className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
