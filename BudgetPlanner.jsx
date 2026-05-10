import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const CATEGORIES = ['Food', 'Transport', 'Hotel', 'Activities', 'Shopping', 'Other'];
const CAT_COLORS = {
  Food: 'from-orange-400 to-red-500',
  Transport: 'from-blue-400 to-indigo-500',
  Hotel: 'from-purple-400 to-pink-500',
  Activities: 'from-green-400 to-emerald-500',
  Shopping: 'from-pink-400 to-rose-500',
  Other: 'from-gray-400 to-slate-500',
};
const CAT_EMOJI = {
  Food: '🍔', Transport: '🚌', Hotel: '🏨', Activities: '🎯', Shopping: '🛍️', Other: '📦',
};

export default function BudgetPlanner() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState('all');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('overview'); // overview, breakdown, comparison

  useEffect(() => {
    api.get('/trips').then(({ data }) => {
      setTrips(data);
      if (data.length > 0) setSelectedTrip(data[0].id);
    }).finally(() => setLoading(false));
  }, []);

  const currentTrip = trips.find((t) => t.id === selectedTrip);
  const allTrips = selectedTrip === 'all';

  // Calculate totals
  const getTripBudget = (trip) => trip.budget?.reduce((s, b) => s + b.cost, 0) || 0;
  const getTripItineraryCost = (trip) =>
    trip.itinerary?.reduce((s, c) => s + (c.activities?.reduce((a, act) => a + (act.cost || 0), 0) || 0), 0) || 0;

  const totalBudget = allTrips
    ? trips.reduce((s, t) => s + getTripBudget(t), 0)
    : getTripBudget(currentTrip || {});

  const totalItinerary = allTrips
    ? trips.reduce((s, t) => s + getTripItineraryCost(t), 0)
    : getTripItineraryCost(currentTrip || {});

  const totalSpent = totalBudget + totalItinerary;

  // Category breakdown
  const categoryData = CATEGORIES.map((cat) => {
    const budgetTotal = allTrips
      ? trips.reduce((s, t) => s + (t.budget?.filter((b) => b.category === cat).reduce((a, b) => a + b.cost, 0) || 0), 0)
      : (currentTrip?.budget?.filter((b) => b.category === cat).reduce((s, b) => s + b.cost, 0) || 0);

    const itineraryTotal = allTrips
      ? trips.reduce((s, t) => s + (t.itinerary?.reduce((a, c) => a + (c.activities?.filter((act) => act.type === cat).reduce((x, act) => x + (act.cost || 0), 0) || 0), 0) || 0), 0)
      : (currentTrip?.itinerary?.reduce((s, c) => s + (c.activities?.filter((act) => act.type === cat).reduce((a, act) => a + (act.cost || 0), 0) || 0), 0) || 0);

    return {
      cat,
      budget: budgetTotal,
      itinerary: itineraryTotal,
      total: budgetTotal + itineraryTotal,
    };
  }).filter((c) => c.total > 0);

  // Trip comparison
  const tripComparison = trips.map((t) => ({
    trip: t,
    budget: getTripBudget(t),
    itinerary: getTripItineraryCost(t),
    total: getTripBudget(t) + getTripItineraryCost(t),
  })).sort((a, b) => b.total - a.total);

  const maxTripTotal = Math.max(...tripComparison.map((t) => t.total), 1);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <PageHeader
          title="💰 Budget Planner"
          subtitle="Track and analyze your travel expenses"
        />

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-lg border border-gray-100">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No trips yet</h3>
            <p className="text-gray-500 mb-6">Create a trip to start budget planning</p>
            <Link to="/create" className="btn-primary inline-flex items-center gap-2">
              <span>+</span> Create Trip
            </Link>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <select
                value={selectedTrip}
                onChange={(e) => setSelectedTrip(e.target.value)}
                className="input flex-1"
              >
                <option value="all">All Trips Combined</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.coverEmoji || '✈️'} {t.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                {['overview', 'breakdown', 'comparison'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                      view === v
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">💵</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Manual Budget</span>
                </div>
                <p className="text-3xl font-bold mb-1">${totalBudget.toFixed(2)}</p>
                <p className="text-indigo-200 text-sm">Planned expenses</p>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📍</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Itinerary Cost</span>
                </div>
                <p className="text-3xl font-bold mb-1">${totalItinerary.toFixed(2)}</p>
                <p className="text-amber-200 text-sm">Activity costs</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">💰</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Total</span>
                </div>
                <p className="text-3xl font-bold mb-1">${totalSpent.toFixed(2)}</p>
                <p className="text-green-200 text-sm">Combined total</p>
              </div>
            </div>

            {/* Overview View */}
            {view === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Budget vs Itinerary */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">📊</span> Budget vs Itinerary
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Manual Budget</span>
                        <span className="font-semibold text-indigo-600">${totalBudget.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all"
                          style={{ width: `${totalSpent > 0 ? (totalBudget / totalSpent) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {totalSpent > 0 ? ((totalBudget / totalSpent) * 100).toFixed(0) : 0}% of total
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Itinerary Cost</span>
                        <span className="font-semibold text-amber-600">${totalItinerary.toFixed(0)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-600 h-3 rounded-full transition-all"
                          style={{ width: `${totalSpent > 0 ? (totalItinerary / totalSpent) * 100 : 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {totalSpent > 0 ? ((totalItinerary / totalSpent) * 100).toFixed(0) : 0}% of total
                      </p>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Total Spending</span>
                        <span className="text-2xl font-bold text-green-600">${totalSpent.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">📈</span> Quick Stats
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        label: 'Average per Trip',
                        value: `$${trips.length > 0 ? (totalSpent / trips.length).toFixed(0) : 0}`,
                        icon: '🗺️',
                        color: 'text-blue-600',
                      },
                      {
                        label: 'Total Categories',
                        value: categoryData.length,
                        icon: '🗂️',
                        color: 'text-purple-600',
                      },
                      {
                        label: 'Budget Items',
                        value: allTrips
                          ? trips.reduce((s, t) => s + (t.budget?.length || 0), 0)
                          : currentTrip?.budget?.length || 0,
                        icon: '🧾',
                        color: 'text-indigo-600',
                      },
                      {
                        label: 'Itinerary Activities',
                        value: allTrips
                          ? trips.reduce(
                              (s, t) =>
                                s + (t.itinerary?.reduce((a, c) => a + (c.activities?.length || 0), 0) || 0),
                              0
                            )
                          : currentTrip?.itinerary?.reduce((s, c) => s + (c.activities?.length || 0), 0) || 0,
                        icon: '🎯',
                        color: 'text-green-600',
                      },
                    ].map((stat, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{stat.icon}</span>
                          <span className="text-sm text-gray-600">{stat.label}</span>
                        </div>
                        <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Breakdown View */}
            {view === 'breakdown' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-xl">🗂️</span> Category Breakdown
                </h3>
                {categoryData.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-3xl mb-2">📊</p>
                    <p>No expenses yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {categoryData.map(({ cat, budget, itinerary, total }) => (
                      <div key={cat} className="group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${CAT_COLORS[cat]} flex items-center justify-center text-2xl shadow-md`}
                            >
                              {CAT_EMOJI[cat]}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{cat}</p>
                              <p className="text-xs text-gray-400">
                                {totalSpent > 0 ? ((total / totalSpent) * 100).toFixed(1) : 0}% of total
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800">${total.toFixed(0)}</p>
                            <p className="text-xs text-gray-400">
                              ${budget.toFixed(0)} + ${itinerary.toFixed(0)}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {/* Budget bar */}
                          {budget > 0 && (
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Manual Budget</span>
                                <span>${budget.toFixed(0)}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-indigo-500 h-2 rounded-full transition-all"
                                  style={{ width: `${total > 0 ? (budget / total) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Itinerary bar */}
                          {itinerary > 0 && (
                            <div>
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Itinerary Cost</span>
                                <span>${itinerary.toFixed(0)}</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-amber-500 h-2 rounded-full transition-all"
                                  style={{ width: `${total > 0 ? (itinerary / total) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Comparison View */}
            {view === 'comparison' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-xl">📊</span> Trip Comparison
                </h3>
                {tripComparison.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-3xl mb-2">🗺️</p>
                    <p>No trips to compare</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tripComparison.map(({ trip, budget, itinerary, total }, i) => (
                      <div key={trip.id} className="group hover:bg-gray-50 rounded-xl p-4 transition">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-2xl flex-shrink-0">{trip.coverEmoji || '✈️'}</span>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/trip/${trip.id}`}
                                className="font-semibold text-gray-800 hover:text-indigo-600 transition truncate block"
                              >
                                {trip.name}
                              </Link>
                              <p className="text-xs text-gray-400">
                                {trip.startDate || 'No date'} → {trip.endDate || 'No date'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xl font-bold text-gray-800">${total.toFixed(0)}</p>
                            <p className="text-xs text-gray-400">
                              {i === 0 && '👑 Highest'}
                              {i === tripComparison.length - 1 && tripComparison.length > 1 && '💚 Lowest'}
                            </p>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all"
                            style={{ width: `${(total / maxTripTotal) * 100}%` }}
                          />
                        </div>

                        {/* Breakdown */}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>💵 Budget: ${budget.toFixed(0)}</span>
                          <span>📍 Itinerary: ${itinerary.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
