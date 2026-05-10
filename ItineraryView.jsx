import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const TYPE_EMOJI = { Sightseeing: '🏛️', Food: '🍽️', Transport: '🚌', Hotel: '🏨', Adventure: '🧗', Shopping: '🛍️', Culture: '🎭', Other: '📌' };
const TYPE_COLOR = { Sightseeing: 'from-blue-400 to-indigo-500', Food: 'from-orange-400 to-red-500', Transport: 'from-gray-400 to-slate-500', Hotel: 'from-purple-400 to-pink-500', Adventure: 'from-green-400 to-emerald-500', Shopping: 'from-pink-400 to-rose-500', Culture: 'from-yellow-400 to-amber-500', Other: 'from-gray-400 to-gray-500' };

export default function ItineraryView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [searchCity, setSearchCity] = useState('');
  const [searchActivity, setSearchActivity] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    api.get(`/trips/${id}`).then(({ data }) => setTrip(data)).catch(() => navigate('/my-trips'));
  }, [id]);

  if (!trip) return <Layout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div></Layout>;

  const itinerary = trip.itinerary || [];
  
  // Apply filters
  const filteredItinerary = itinerary
    .map((city) => ({
      ...city,
      activities: (city.activities || []).filter((act) => {
        const matchActivity = act.name.toLowerCase().includes(searchActivity.toLowerCase());
        const matchType = filterType === 'all' || act.type === filterType;
        return matchActivity && matchType;
      }),
    }))
    .filter((city) => {
      const matchCity = city.city.toLowerCase().includes(searchCity.toLowerCase());
      const hasActivities = searchActivity || filterType !== 'all' ? city.activities.length > 0 : true;
      return matchCity && hasActivities;
    });

  const totalActivities = itinerary.reduce((s, c) => s + (c.activities?.length || 0), 0);
  const totalCost = itinerary.reduce((s, c) => s + (c.activities?.reduce((a, act) => a + (act.cost || 0), 0) || 0), 0);
  const activityTypes = [...new Set(itinerary.flatMap((c) => c.activities?.map((a) => a.type) || []))];

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto animate-fade-in">
        <PageHeader
          title="📅 Itinerary Timeline"
          subtitle={trip.name}
          backTo={`/trip/${id}`}
          actions={<Link to={`/trip/${id}/itinerary/build`} className="btn-primary">✏️ Edit Itinerary</Link>}
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Cities', value: itinerary.length, icon: '📍', color: 'from-blue-500 to-indigo-600' },
            { label: 'Activities', value: totalActivities, icon: '🎯', color: 'from-purple-500 to-pink-600' },
            { label: 'Est. Cost', value: `$${totalCost.toFixed(0)}`, icon: '💰', color: 'from-amber-500 to-orange-600' },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-4 shadow-lg text-center`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        {itinerary.length > 0 && (
          <div className="card mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>🔍</span> Search & Filter
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search cities..."
                className="input"
              />
              <input
                value={searchActivity}
                onChange={(e) => setSearchActivity(e.target.value)}
                placeholder="Search activities..."
                className="input"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                  filterType === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Types
              </button>
              {activityTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                    filterType === type
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {TYPE_EMOJI[type]} {type}
                </button>
              ))}
            </div>
            {(searchCity || searchActivity || filterType !== 'all') && (
              <button
                onClick={() => {
                  setSearchCity('');
                  setSearchActivity('');
                  setFilterType('all');
                }}
                className="text-xs text-indigo-500 hover:underline mt-2"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {itinerary.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl shadow-lg border border-gray-100">
            <p className="text-6xl mb-4">🗺️</p>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No itinerary yet</h3>
            <p className="text-gray-500 mb-6">Start building your travel plan!</p>
            <Link to={`/trip/${id}/itinerary/build`} className="btn-primary">Build Itinerary</Link>
          </div>
        ) : filteredItinerary.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500">No results match your search.</p>
            <button
              onClick={() => {
                setSearchCity('');
                setSearchActivity('');
                setFilterType('all');
              }}
              className="text-indigo-500 text-sm hover:underline mt-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-400 z-0 rounded-full" />

            <div className="space-y-8 relative z-10">
              {filteredItinerary.map((city, cityIdx) => (
                <div key={cityIdx} className="flex gap-4 animate-slide-up" style={{ animationDelay: `${cityIdx * 0.1}s` }}>
                  {/* Timeline dot */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-xl z-10 ring-4 ring-white">
                    {itinerary.indexOf(city) + 1}
                  </div>

                  <div className="flex-1 pb-2">
                    {/* City card */}
                    <div className="card-hover">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-5 py-4 -m-6 mb-4 rounded-t-2xl">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div>
                            <h3 className="font-bold text-xl">📍 {city.city}</h3>
                            {city.date && <p className="text-indigo-200 text-xs mt-1">{city.date}</p>}
                          </div>
                          <Link
                            to={`/trip/${id}/city/${itinerary.indexOf(city)}`}
                            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full backdrop-blur-sm transition"
                          >
                            View City →
                          </Link>
                        </div>
                      </div>

                      {city.notes && (
                        <div className="px-5 py-3 bg-indigo-50 text-xs text-indigo-700 italic mb-3 -mx-6 rounded-xl mx-0">
                          📝 {city.notes}
                        </div>
                      )}

                      {/* Activities */}
                      {city.activities.length > 0 ? (
                        <div className="space-y-2">
                          {city.activities.map((act, actIdx) => (
                            <div
                              key={actIdx}
                              className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-indigo-50/30 border border-gray-100 hover:shadow-md transition group"
                            >
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${TYPE_COLOR[act.type]} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
                                {TYPE_EMOJI[act.type] || '📌'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm font-semibold text-gray-800">{act.name}</p>
                                  <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${TYPE_COLOR[act.type]} text-white`}>
                                    {act.type}
                                  </span>
                                </div>
                                <div className="flex gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                                  {act.time && <span>🕐 {act.time}</span>}
                                  {act.cost > 0 && <span>💰 ${act.cost}</span>}
                                  {act.notes && <span className="truncate max-w-xs">📝 {act.notes}</span>}
                                </div>
                              </div>
                              <Link
                                to={`/trip/${id}/city/${itinerary.indexOf(city)}/activity/${city.activities.indexOf(act)}`}
                                className="text-indigo-400 hover:text-indigo-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition"
                              >
                                →
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic text-center py-4">No activities added yet.</p>
                      )}

                      {/* City cost summary */}
                      {city.activities?.some((a) => a.cost > 0) && (
                        <div className="flex justify-between items-center mt-4 pt-3 border-t text-sm">
                          <span className="text-gray-500">{city.activities.length} activities</span>
                          <span className="font-bold text-indigo-600">
                            Subtotal: ${city.activities.reduce((s, a) => s + (a.cost || 0), 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* End marker */}
              <div className="flex gap-4 animate-scale-in">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-2xl shadow-xl ring-4 ring-white">
                  🏁
                </div>
                <div className="flex-1 flex items-center">
                  <div className="card w-full">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">End of Trip</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {filteredItinerary.length} cities · {filteredItinerary.reduce((s, c) => s + c.activities.length, 0)} activities
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total Cost</p>
                        <p className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
