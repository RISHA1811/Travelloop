import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const TYPE_EMOJI = { Sightseeing: '🏛️', Food: '🍽️', Transport: '🚌', Hotel: '🏨', Adventure: '🧗', Shopping: '🛍️', Culture: '🎭', Other: '📌' };
const TYPE_COLOR = { Sightseeing: 'bg-blue-100 text-blue-700', Food: 'bg-orange-100 text-orange-700', Transport: 'bg-gray-100 text-gray-600', Hotel: 'bg-purple-100 text-purple-700', Adventure: 'bg-green-100 text-green-700', Shopping: 'bg-pink-100 text-pink-700', Culture: 'bg-yellow-100 text-yellow-700', Other: 'bg-gray-100 text-gray-600' };

export default function CityScreen() {
  const { id, cityIdx } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [city, setCity] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get(`/trips/${id}`).then(({ data }) => {
      setTrip(data);
      const c = data.itinerary?.[parseInt(cityIdx)];
      if (!c) return navigate(`/trip/${id}/itinerary/build`);
      setCity(c);
      setForm({ city: c.city, date: c.date || '', notes: c.notes || '' });
    }).catch(() => navigate('/my-trips'));
  }, [id, cityIdx]);

  const save = async (updatedCity) => {
    const itinerary = trip.itinerary.map((c, i) => i === parseInt(cityIdx) ? updatedCity : c);
    const { data } = await api.put(`/trips/${id}`, { ...trip, itinerary });
    setTrip(data);
    setCity(data.itinerary[parseInt(cityIdx)]);
  };

  const saveEdit = () => { save({ ...city, ...form }); setEditing(false); };

  const removeActivity = (actIdx) => {
    save({ ...city, activities: city.activities.filter((_, i) => i !== actIdx) });
  };

  if (!city) return <Layout><div className="flex items-center justify-center h-64 text-gray-400">Loading...</div></Layout>;

  const totalCost = city.activities?.reduce((s, a) => s + (a.cost || 0), 0) || 0;
  const byType = [...new Set(city.activities?.map((a) => a.type) || [])];

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto">
        <PageHeader
          title={`📍 ${city.city}`}
          subtitle={city.date || 'No date set'}
          backTo={`/trip/${id}/itinerary/build`}
          actions={
            <div className="flex gap-2">
              <button onClick={() => setEditing(!editing)} className="border border-indigo-300 text-indigo-600 text-sm px-3 py-1.5 rounded-xl hover:bg-indigo-50">
                {editing ? 'Cancel' : '✏️ Edit City'}
              </button>
              <Link to={`/trip/${id}/itinerary/build`} className="btn-primary">+ Add Activity</Link>
            </div>
          }
        />

        {/* Edit form */}
        {editing && (
          <div className="bg-white rounded-2xl shadow p-5 mb-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City Name</label>
                <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input w-full" />
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input w-full" />
              </div>
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input w-full resize-none" rows={2} />
            </div>
            <button onClick={saveEdit} className="btn-primary">Save</button>
          </div>
        )}

        {/* City stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Activities', value: city.activities?.length || 0, icon: '🎯' },
            { label: 'Est. Cost', value: `$${totalCost.toFixed(0)}`, icon: '💰' },
            { label: 'Types', value: byType.length, icon: '🗂️' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow p-3 text-center">
              <p className="text-xl">{s.icon}</p>
              <p className="text-lg font-bold text-indigo-700">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Notes */}
        {city.notes && (
          <div className="bg-indigo-50 rounded-xl p-4 mb-5 text-sm text-indigo-700">
            📝 {city.notes}
          </div>
        )}

        {/* Activities */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Activities</h3>
            <span className="text-xs text-gray-400">{city.activities?.length || 0} total</span>
          </div>

          {(city.activities || []).length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-sm">No activities yet.</p>
              <Link to={`/trip/${id}/itinerary/build`} className="text-indigo-500 text-sm hover:underline mt-1 block">Add activities in the builder →</Link>
            </div>
          ) : (
            <div className="divide-y">
              {city.activities.map((act, actIdx) => (
                <div key={actIdx} className="px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition">
                  <span className="text-2xl">{TYPE_EMOJI[act.type] || '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-800">{act.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR[act.type] || 'bg-gray-100 text-gray-600'}`}>{act.type}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                      {act.time && <span>🕐 {act.time}</span>}
                      {act.cost > 0 && <span>💰 ${act.cost}</span>}
                      {act.notes && <span>📝 {act.notes}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/trip/${id}/city/${cityIdx}/activity/${actIdx}`}
                      className="text-xs text-indigo-500 hover:underline">Details</Link>
                    <button onClick={() => removeActivity(actIdx)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalCost > 0 && (
            <div className="px-5 py-3 bg-indigo-50 border-t flex justify-between text-sm font-semibold text-indigo-700">
              <span>Total for {city.city}</span>
              <span>${totalCost.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
