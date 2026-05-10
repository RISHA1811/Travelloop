import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const ACTIVITY_TYPES = ['Sightseeing', 'Food', 'Transport', 'Hotel', 'Adventure', 'Shopping', 'Culture', 'Other'];
const TYPE_EMOJI = { Sightseeing: '🏛️', Food: '🍽️', Transport: '🚌', Hotel: '🏨', Adventure: '🧗', Shopping: '🛍️', Culture: '🎭', Other: '📌' };
const TYPE_COLOR = { Sightseeing: 'from-blue-400 to-indigo-500', Food: 'from-orange-400 to-red-500', Transport: 'from-gray-400 to-slate-500', Hotel: 'from-purple-400 to-pink-500', Adventure: 'from-green-400 to-emerald-500', Shopping: 'from-pink-400 to-rose-500', Culture: 'from-yellow-400 to-amber-500', Other: 'from-gray-400 to-gray-500' };

// Popular cities database
const POPULAR_CITIES = [
  { name: 'Paris', country: 'France', emoji: '🇫🇷' },
  { name: 'Tokyo', country: 'Japan', emoji: '🇯🇵' },
  { name: 'New York', country: 'USA', emoji: '🇺🇸' },
  { name: 'London', country: 'UK', emoji: '🇬🇧' },
  { name: 'Dubai', country: 'UAE', emoji: '🇦🇪' },
  { name: 'Barcelona', country: 'Spain', emoji: '🇪🇸' },
  { name: 'Rome', country: 'Italy', emoji: '🇮🇹' },
  { name: 'Bangkok', country: 'Thailand', emoji: '🇹🇭' },
  { name: 'Singapore', country: 'Singapore', emoji: '🇸🇬' },
  { name: 'Amsterdam', country: 'Netherlands', emoji: '🇳🇱' },
  { name: 'Sydney', country: 'Australia', emoji: '🇦🇺' },
  { name: 'Istanbul', country: 'Turkey', emoji: '🇹🇷' },
  { name: 'Berlin', country: 'Germany', emoji: '🇩🇪' },
  { name: 'Prague', country: 'Czech Republic', emoji: '🇨🇿' },
  { name: 'Vienna', country: 'Austria', emoji: '🇦🇹' },
];

// Popular activities database
const POPULAR_ACTIVITIES = {
  Sightseeing: ['Visit Eiffel Tower', 'Explore Old Town', 'City Walking Tour', 'Museum Visit', 'Historical Landmarks', 'Architecture Tour', 'Viewpoint Visit', 'Castle Tour'],
  Food: ['Local Restaurant', 'Street Food Tour', 'Fine Dining', 'Food Market Visit', 'Cooking Class', 'Wine Tasting', 'Breakfast Spot', 'Dinner Cruise'],
  Transport: ['Airport Transfer', 'Train Ride', 'Bus Tour', 'Car Rental', 'Taxi', 'Metro Pass', 'Ferry Ride', 'Bike Rental'],
  Hotel: ['Hotel Check-in', 'Hostel Stay', 'Airbnb', 'Resort Booking', 'Hotel Check-out', 'Room Service', 'Spa Treatment', 'Pool Time'],
  Adventure: ['Hiking', 'Scuba Diving', 'Zip Lining', 'Rock Climbing', 'Paragliding', 'Bungee Jumping', 'Safari', 'Kayaking'],
  Shopping: ['Souvenir Shopping', 'Local Market', 'Mall Visit', 'Boutique Shopping', 'Antique Store', 'Craft Market', 'Designer Outlet', 'Duty Free'],
  Culture: ['Theater Show', 'Concert', 'Art Gallery', 'Cultural Festival', 'Traditional Dance', 'Opera', 'Local Performance', 'Exhibition'],
  Other: ['Free Time', 'Rest Day', 'Beach Day', 'Park Visit', 'Photography', 'Relaxation', 'Meeting', 'Work Session'],
};

export default function ItineraryBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [cityForm, setCityForm] = useState({ city: '', date: '', notes: '' });
  const [activityForms, setActivityForms] = useState({});
  const [expandedCity, setExpandedCity] = useState(null);
  const [editingCity, setEditingCity] = useState(null);
  const [saved, setSaved] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [activitySearch, setActivitySearch] = useState({});
  const [showActivitySearch, setShowActivitySearch] = useState({});

  useEffect(() => {
    api.get(`/trips/${id}`).then(({ data }) => {
      setTrip(data);
      setItinerary(data.itinerary || []);
    }).catch(() => navigate('/my-trips'));
  }, [id]);

  const saveItinerary = async (updated) => {
    const { data } = await api.put(`/trips/${id}`, { ...trip, itinerary: updated });
    setTrip(data);
    setItinerary(data.itinerary);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addCity = (cityName = null) => {
    const name = cityName || cityForm.city.trim();
    if (!name) return;
    const updated = [...itinerary, { id: Date.now().toString(), city: name, date: cityForm.date, notes: cityForm.notes, activities: [] }];
    saveItinerary(updated);
    setCityForm({ city: '', date: '', notes: '' });
    setCitySearch('');
    setShowCitySearch(false);
    setExpandedCity(updated.length - 1);
  };

  const removeCity = (idx) => {
    if (!confirm('Remove this city and all its activities?')) return;
    saveItinerary(itinerary.filter((_, i) => i !== idx));
  };

  const updateCity = (idx, fields) => {
    const updated = itinerary.map((c, i) => i === idx ? { ...c, ...fields } : c);
    saveItinerary(updated);
    setEditingCity(null);
  };

  const addActivity = (cityIdx, activityName = null) => {
    const form = activityForms[cityIdx] || {};
    const name = activityName || form.name?.trim();
    if (!name) return;
    const updated = itinerary.map((c, i) =>
      i === cityIdx ? { ...c, activities: [...(c.activities || []), { id: Date.now().toString(), name, time: form.time || '', type: form.type || 'Sightseeing', cost: parseFloat(form.cost) || 0, notes: form.notes || '' }] } : c
    );
    saveItinerary(updated);
    setActivityForms((p) => ({ ...p, [cityIdx]: {} }));
    setActivitySearch((p) => ({ ...p, [cityIdx]: '' }));
    setShowActivitySearch((p) => ({ ...p, [cityIdx]: false }));
  };

  const removeActivity = (cityIdx, actIdx) => {
    const updated = itinerary.map((c, i) =>
      i === cityIdx ? { ...c, activities: c.activities.filter((_, j) => j !== actIdx) } : c
    );
    saveItinerary(updated);
  };

  const moveCity = (idx, dir) => {
    const arr = [...itinerary];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    saveItinerary(arr);
  };

  const moveActivity = (cityIdx, actIdx, dir) => {
    const updated = itinerary.map((c, i) => {
      if (i !== cityIdx) return c;
      const acts = [...c.activities];
      const target = actIdx + dir;
      if (target < 0 || target >= acts.length) return c;
      [acts[actIdx], acts[target]] = [acts[target], acts[actIdx]];
      return { ...c, activities: acts };
    });
    saveItinerary(updated);
  };

  const duplicateCity = (idx) => {
    const city = { ...itinerary[idx], id: Date.now().toString(), city: `${itinerary[idx].city} (Copy)` };
    const updated = [...itinerary.slice(0, idx + 1), city, ...itinerary.slice(idx + 1)];
    saveItinerary(updated);
  };

  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.country.toLowerCase().includes(citySearch.toLowerCase())
  );

  const getFilteredActivities = (cityIdx) => {
    const form = activityForms[cityIdx] || {};
    const type = form.type || 'Sightseeing';
    const search = activitySearch[cityIdx] || '';
    return (POPULAR_ACTIVITIES[type] || []).filter((a) =>
      a.toLowerCase().includes(search.toLowerCase())
    );
  };

  if (!trip) return <Layout><div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div></Layout>;

  const totalActivities = itinerary.reduce((s, c) => s + (c.activities?.length || 0), 0);
  const totalCost = itinerary.reduce((s, c) => s + (c.activities?.reduce((a, act) => a + (act.cost || 0), 0) || 0), 0);

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        <PageHeader
          title="🗺️ Itinerary Builder"
          subtitle={trip.name}
          backTo={`/trip/${id}`}
          actions={
            <div className="flex gap-2 flex-wrap">
              {saved && <span className="text-green-600 text-sm bg-green-50 px-3 py-1.5 rounded-lg animate-scale-in">✓ Saved</span>}
              <Link to={`/trip/${id}/itinerary`} className="btn-primary">📅 View Timeline →</Link>
            </div>
          }
        />

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Cities', value: itinerary.length, icon: '📍', color: 'from-blue-500 to-indigo-600' },
            { label: 'Activities', value: totalActivities, icon: '🎯', color: 'from-purple-500 to-pink-600' },
            { label: 'Est. Cost', value: `$${totalCost.toFixed(0)}`, icon: '💰', color: 'from-amber-500 to-orange-600' },
          ].map((s) => (
            <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-4 shadow-lg`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add City Form */}
        <div className="card mb-6 animate-slide-up">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">➕</span> Add City / Stop
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <input
                  value={cityForm.city}
                  onChange={(e) => {
                    setCityForm({ ...cityForm, city: e.target.value });
                    setCitySearch(e.target.value);
                    setShowCitySearch(true);
                  }}
                  onFocus={() => setShowCitySearch(true)}
                  placeholder="City name *"
                  className="input w-full"
                />
                {showCitySearch && citySearch && filteredCities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {filteredCities.slice(0, 8).map((city, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCityForm({ ...cityForm, city: city.name });
                          setCitySearch('');
                          setShowCitySearch(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 transition flex items-center gap-3 border-b last:border-0"
                      >
                        <span className="text-2xl">{city.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{city.name}</p>
                          <p className="text-xs text-gray-400">{city.country}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input type="date" value={cityForm.date} onChange={(e) => setCityForm({ ...cityForm, date: e.target.value })} className="input" />
              <input value={cityForm.notes} onChange={(e) => setCityForm({ ...cityForm, notes: e.target.value })} placeholder="Notes (optional)" className="input" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => addCity()} className="btn-primary">Add City</button>
              <button onClick={() => { setCityForm({ city: '', date: '', notes: '' }); setCitySearch(''); setShowCitySearch(false); }} className="btn-secondary">Clear</button>
            </div>
          </div>

          {/* Popular Cities Quick Add */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs font-semibold text-gray-500 mb-2">🔥 Popular Destinations:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_CITIES.slice(0, 6).map((city, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => addCity(city.name)}
                  className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-full hover:from-indigo-100 hover:to-purple-100 transition"
                >
                  {city.emoji} {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Itinerary List */}
        {itinerary.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-gray-100">
            <p className="text-6xl mb-4">🗺️</p>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No cities added yet</h3>
            <p className="text-gray-500">Add your first destination above to start building your itinerary!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {itinerary.map((city, cityIdx) => (
              <div key={cityIdx} className="card-hover animate-slide-up" style={{ animationDelay: `${cityIdx * 0.05}s` }}>
                {/* City Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-2xl p-4 -m-6 mb-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm backdrop-blur-sm">
                        {cityIdx + 1}
                      </div>
                      {editingCity === cityIdx ? (
                        <div className="flex gap-2 flex-wrap">
                          <input defaultValue={city.city} id={`city-name-${cityIdx}`} className="input text-gray-800 text-sm py-1 w-32" />
                          <input type="date" defaultValue={city.date} id={`city-date-${cityIdx}`} className="input text-gray-800 text-sm py-1" />
                          <button onClick={() => updateCity(cityIdx, {
                            city: document.getElementById(`city-name-${cityIdx}`).value,
                            date: document.getElementById(`city-date-${cityIdx}`).value,
                          })} className="bg-white text-indigo-600 text-xs px-3 py-1 rounded-lg font-semibold hover:bg-indigo-50">Save</button>
                          <button onClick={() => setEditingCity(null)} className="text-white/70 text-xs hover:text-white">Cancel</button>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-lg">📍 {city.city}</p>
                          {city.date && <p className="text-indigo-200 text-xs">{city.date}</p>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => moveCity(cityIdx, -1)} disabled={cityIdx === 0} className="text-white/70 hover:text-white text-lg disabled:opacity-30 p-1" title="Move up">↑</button>
                      <button onClick={() => moveCity(cityIdx, 1)} disabled={cityIdx === itinerary.length - 1} className="text-white/70 hover:text-white text-lg disabled:opacity-30 p-1" title="Move down">↓</button>
                      <button onClick={() => duplicateCity(cityIdx)} className="text-white/70 hover:text-white text-sm p-1" title="Duplicate">📋</button>
                      <button onClick={() => setEditingCity(cityIdx)} className="text-white/70 hover:text-white text-sm p-1">✏️</button>
                      <button onClick={() => setExpandedCity(expandedCity === cityIdx ? null : cityIdx)} className="text-white/70 hover:text-white text-sm p-1">
                        {expandedCity === cityIdx ? '▲' : '▼'}
                      </button>
                      <button onClick={() => removeCity(cityIdx)} className="text-red-300 hover:text-red-100 text-sm p-1">✕</button>
                    </div>
                  </div>
                </div>

                {/* Activities */}
                {expandedCity === cityIdx && (
                  <div className="space-y-3">
                    {city.notes && <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl">📝 {city.notes}</p>}

                    {/* Activity list */}
                    {(city.activities || []).length > 0 && (
                      <div className="space-y-2">
                        {city.activities.map((act, actIdx) => (
                          <div key={actIdx} className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-xl px-4 py-3 border border-gray-100 group hover:shadow-md transition">
                            <span className="text-xl">{TYPE_EMOJI[act.type] || '📌'}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800">{act.name}</p>
                              <div className="flex gap-3 text-xs text-gray-400 flex-wrap mt-0.5">
                                {act.time && <span>🕐 {act.time}</span>}
                                <span className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${TYPE_COLOR[act.type]} text-white`}>{act.type}</span>
                                {act.cost > 0 && <span>💰 ${act.cost}</span>}
                                {act.notes && <span className="truncate max-w-xs">📝 {act.notes}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                              <button onClick={() => moveActivity(cityIdx, actIdx, -1)} disabled={actIdx === 0} className="text-gray-400 hover:text-gray-600 text-sm disabled:opacity-30">↑</button>
                              <button onClick={() => moveActivity(cityIdx, actIdx, 1)} disabled={actIdx === city.activities.length - 1} className="text-gray-400 hover:text-gray-600 text-sm disabled:opacity-30">↓</button>
                              <Link to={`/trip/${id}/city/${cityIdx}/activity/${actIdx}`} className="text-indigo-500 text-xs hover:underline">Edit</Link>
                              <button onClick={() => removeActivity(cityIdx, actIdx)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Activity Form */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 space-y-3 border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-700">+ Add Activity</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="relative sm:col-span-2">
                          <input
                            value={activityForms[cityIdx]?.name || ''}
                            onChange={(e) => {
                              setActivityForms((p) => ({ ...p, [cityIdx]: { ...p[cityIdx], name: e.target.value } }));
                              setActivitySearch((p) => ({ ...p, [cityIdx]: e.target.value }));
                              setShowActivitySearch((p) => ({ ...p, [cityIdx]: true }));
                            }}
                            onFocus={() => setShowActivitySearch((p) => ({ ...p, [cityIdx]: true }))}
                            placeholder="Activity name *"
                            className="input text-sm w-full"
                          />
                          {showActivitySearch[cityIdx] && activitySearch[cityIdx] && getFilteredActivities(cityIdx).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                              {getFilteredActivities(cityIdx).slice(0, 6).map((activity, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    setActivityForms((p) => ({ ...p, [cityIdx]: { ...p[cityIdx], name: activity } }));
                                    setActivitySearch((p) => ({ ...p, [cityIdx]: '' }));
                                    setShowActivitySearch((p) => ({ ...p, [cityIdx]: false }));
                                  }}
                                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition text-sm border-b last:border-0"
                                >
                                  {TYPE_EMOJI[activityForms[cityIdx]?.type || 'Sightseeing']} {activity}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input type="time" value={activityForms[cityIdx]?.time || ''} onChange={(e) => setActivityForms((p) => ({ ...p, [cityIdx]: { ...p[cityIdx], time: e.target.value } }))} className="input text-sm" />
                        <select value={activityForms[cityIdx]?.type || 'Sightseeing'} onChange={(e) => setActivityForms((p) => ({ ...p, [cityIdx]: { ...p[cityIdx], type: e.target.value } }))} className="input text-sm">
                          {ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                        <input type="number" value={activityForms[cityIdx]?.cost || ''} onChange={(e) => setActivityForms((p) => ({ ...p, [cityIdx]: { ...p[cityIdx], cost: e.target.value } }))} placeholder="Cost ($)" className="input text-sm" />
                        <input value={activityForms[cityIdx]?.notes || ''} onChange={(e) => setActivityForms((p) => ({ ...p, [cityIdx]: { ...p[cityIdx], notes: e.target.value } }))} placeholder="Notes" className="input text-sm" />
                      </div>
                      <button onClick={() => addActivity(cityIdx)} className="btn-primary text-sm w-full">Add Activity</button>

                      {/* Popular Activities Quick Add */}
                      <div className="pt-2 border-t border-indigo-200">
                        <p className="text-xs font-semibold text-indigo-600 mb-2">💡 Suggestions:</p>
                        <div className="flex flex-wrap gap-1">
                          {(POPULAR_ACTIVITIES[activityForms[cityIdx]?.type || 'Sightseeing'] || []).slice(0, 4).map((activity, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => addActivity(cityIdx, activity)}
                              className="text-xs bg-white border border-indigo-200 text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition"
                            >
                              {activity}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Link to={`/trip/${id}/city/${cityIdx}`} className="text-xs text-indigo-500 hover:underline block text-center">
                      View full city details →
                    </Link>
                  </div>
                )}

                {/* Collapsed summary */}
                {expandedCity !== cityIdx && (
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{city.activities?.length || 0} activities</span>
                    {city.activities?.reduce((s, a) => s + (a.cost || 0), 0) > 0 && (
                      <span>💰 ${city.activities.reduce((s, a) => s + (a.cost || 0), 0).toFixed(0)}</span>
                    )}
                    <button onClick={() => setExpandedCity(cityIdx)} className="ml-auto text-indigo-500 hover:underline">Expand ▼</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
