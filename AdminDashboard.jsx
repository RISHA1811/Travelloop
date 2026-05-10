import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [tab, setTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/'); return; }
    api.get('/admin/stats').then(({ data }) => {
      setStats(data.stats);
      setUsers(data.users);
      setTrips(data.trips);
    }).finally(() => setLoading(false));
  }, [user]);

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user and all their trips?')) return;
    await api.delete(`/admin/users/${userId}`);
    setUsers((p) => p.filter((u) => u.id !== userId));
    setTrips((p) => p.filter((t) => t.userId !== userId));
  };

  const deleteTrip = async (tripId) => {
    if (!confirm('Delete this trip?')) return;
    await api.delete(`/admin/trips/${tripId}`);
    setTrips((p) => p.filter((t) => t.id !== tripId));
  };

  const toggleAdmin = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await api.put(`/admin/users/${userId}`, { role: newRole });
    setUsers((p) => p.map((u) => u.id === userId ? { ...u, role: newRole } : u));
  };

  if (user?.role !== 'admin') return null;

  const filteredUsers = users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
  const filteredTrips = trips.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase()));

  const TABS = ['Overview', 'Users', 'Trips'];

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <PageHeader
          title="🛡️ Admin Dashboard"
          subtitle="Platform management and analytics"
        />

        {/* Admin badge */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5 flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <p className="text-sm text-red-600">You are in Admin mode. Changes here affect all users.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow mb-5">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 text-sm py-2 px-3 rounded-lg font-medium transition ${tab === t ? 'bg-red-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Overview Tab */}
            {tab === 'Overview' && stats && (
              <div className="space-y-5">
                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'bg-blue-600' },
                    { label: 'Total Trips', value: stats.totalTrips, icon: '🗺️', color: 'bg-indigo-600' },
                    { label: 'Total Budget', value: `$${stats.totalBudget?.toFixed(0) || 0}`, icon: '💰', color: 'bg-amber-500' },
                    { label: 'Avg Trips/User', value: stats.totalUsers > 0 ? (stats.totalTrips / stats.totalUsers).toFixed(1) : 0, icon: '📊', color: 'bg-purple-600' },
                  ].map((s) => (
                    <div key={s.label} className={`${s.color} text-white rounded-2xl p-5 shadow`}>
                      <p className="text-3xl mb-2">{s.icon}</p>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-sm opacity-80">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl shadow p-5">
                    <h3 className="font-semibold text-gray-700 mb-4">👥 Recent Users</h3>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((u) => (
                        <div key={u.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                            <p className="text-xs text-gray-400 truncate">{u.email}</p>
                          </div>
                          {u.role === 'admin' && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Admin</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow p-5">
                    <h3 className="font-semibold text-gray-700 mb-4">🗺️ Recent Trips</h3>
                    <div className="space-y-3">
                      {trips.slice(0, 5).map((t) => (
                        <div key={t.id} className="flex items-center gap-3">
                          <span className="text-xl">{t.coverEmoji || '✈️'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                            <p className="text-xs text-gray-400">{t.startDate || 'No date'}</p>
                          </div>
                          <span className="text-xs text-gray-400">${(t.budget?.reduce((s, b) => s + b.cost, 0) || 0).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Platform stats */}
                <div className="bg-white rounded-2xl shadow p-5">
                  <h3 className="font-semibold text-gray-700 mb-4">📊 Platform Stats</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    {[
                      { label: 'Total Activities', value: stats.totalActivities || 0 },
                      { label: 'Total Packing Items', value: stats.totalPackingItems || 0 },
                      { label: 'Shared Trips', value: stats.sharedTrips || 0 },
                      { label: 'Journal Entries', value: stats.totalJournalEntries || 0 },
                    ].map((s) => (
                      <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xl font-bold text-indigo-700">{s.value}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {tab === 'Users' && (
              <div className="space-y-4">
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search users..." className="input w-full" />
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left px-4 py-3">User</th>
                        <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
                        <th className="text-center px-4 py-3">Trips</th>
                        <th className="text-center px-4 py-3">Role</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-800">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{u.email}</td>
                          <td className="px-4 py-3 text-center">{trips.filter((t) => t.userId === u.id).length}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                              {u.role || 'user'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 justify-center">
                              {u.id !== user.id && (
                                <>
                                  <button onClick={() => toggleAdmin(u.id, u.role)}
                                    className="text-xs text-indigo-500 hover:underline">
                                    {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                  </button>
                                  <button onClick={() => deleteUser(u.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                                </>
                              )}
                              {u.id === user.id && <span className="text-xs text-gray-400">You</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Trips Tab */}
            {tab === 'Trips' && (
              <div className="space-y-4">
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search trips..." className="input w-full" />
                <div className="bg-white rounded-2xl shadow overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left px-4 py-3">Trip</th>
                        <th className="text-left px-4 py-3 hidden sm:table-cell">Owner</th>
                        <th className="text-left px-4 py-3 hidden md:table-cell">Dates</th>
                        <th className="text-right px-4 py-3">Budget</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrips.map((t) => {
                        const owner = users.find((u) => u.id === t.userId);
                        const budget = t.budget?.reduce((s, b) => s + b.cost, 0) || 0;
                        return (
                          <tr key={t.id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span>{t.coverEmoji || '✈️'}</span>
                                <span className="font-medium text-gray-800">{t.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{owner?.name || '—'}</td>
                            <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">{t.startDate || '—'} → {t.endDate || '—'}</td>
                            <td className="px-4 py-3 text-right font-medium">${budget.toFixed(0)}</td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => deleteTrip(t.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
