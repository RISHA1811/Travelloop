import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const ACTIVITY_TYPES = ['Sightseeing', 'Food', 'Transport', 'Hotel', 'Adventure', 'Shopping', 'Culture', 'Other'];
const TYPE_EMOJI = { Sightseeing: '🏛️', Food: '🍽️', Transport: '🚌', Hotel: '🏨', Adventure: '🧗', Shopping: '🛍️', Culture: '🎭', Other: '📌' };
const TYPE_BG = { Sightseeing: 'from-blue-500 to-indigo-500', Food: 'from-orange-400 to-red-400', Transport: 'from-gray-400 to-gray-600', Hotel: 'from-purple-500 to-pink-500', Adventure: 'from-green-500 to-teal-500', Shopping: 'from-pink-400 to-rose-500', Culture: 'from-yellow-400 to-amber-500', Other: 'from-gray-400 to-gray-500' };

export default function ActivityScreen() {
  const { id, cityIdx, actIdx } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [activity, setActivity] = useState(null);
  const [city, setCity] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/trips/${id}`).then(({ data }) => {
      setTrip(data);
      const c = data.itinerary?.[parseInt(cityIdx)];
      const a = c?.activities?.[parseInt(actIdx)];
      if (!c || !a) return navigate(`/trip/${id}/itinerary/build`);
      setCity(c);
      setActivity(a);
      setForm({ name: a.name, time: a.time || '', type: a.type || 'Sightseeing', cost: a.cost || 0, notes: a.notes || '', description: a.description || '' });
    }).catch(() => navigate('/my-trips'));
  }, [id, cityIdx, actIdx]);

  const saveActivity = async () => {
    const itinerary = trip.itinerary.map((c, ci) =>
      ci === parseInt(cityIdx)
        ? { ...c, activities: c.activities.map((a, ai) => ai === parseInt(actIdx) ? { ...a, ...form, cost: parseFloat(form.cost) || 0 } : a) }
        : c
    );
    const { data } = await api.put(`/trips/${id}`, { ...trip, itinerary });
    setTrip(data);
    setActivity(data.itinerary[parseInt(cityIdx)].activities[parseInt(actIdx)]);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!activity) return <Layout><div className="flex items-center justify-center h-64 text-gray-400">Loading...</div></Layout>;

  const gradient = TYPE_BG[activity.type] || 'from-gray-400 to-gray-500';

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto">
        <PageHeader
          title="Activity Details"
          backTo={`/trip/${id}/city/${cityIdx}`}
          actions={
            <div className="flex gap-2">
              {saved && <span className="text-green-600 text-sm bg-green-50 px-3 py-1.5 rounded-lg">✓ Saved</span>}
              <button onClick={() => setEditing(!editing)} className="btn-primary">
                {editing ? 'Cancel' : '✏️ Edit'}
              </button>
            </div>
          }
        />

        {/* Hero card */}
        <div className={`bg-gradient-to-r ${gradient} text-white rounded-2xl p-6 mb-5 shadow`}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{TYPE_EMOJI[activity.type] || '📌'}</span>
            <div>
              <h2 className="text-2xl font-bold">{activity.name}</h2>
              <p className="text-white/80 text-sm mt-1">📍 {city?.city} {city?.date && `· ${city.date}`}</p>
              <div className="flex gap-3 mt-2 text-sm flex-wrap">
                {activity.time && <span>🕐 {activity.time}</span>}
                {activity.cost > 0 && <span>💰 ${activity.cost}</span>}
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{activity.type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        {editing ? (
          <div className="bg-white rounded-2xl shadow p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Activity Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input w-full" />
              </div>
              <div>
                <label className="label">Time</label>
                <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="input w-full" />
              </div>
              <div>
                <label className="label">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input w-full">
                  {ACTIVITY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Cost ($)</label>
                <input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="input w-full" />
              </div>
              <div>
                <label className="label">Short Notes</label>
                <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input w-full" />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input w-full resize-none" rows={3} />
              </div>
            </div>
            <button onClick={saveActivity} className="btn-primary w-full">Save Activity</button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-5 space-y-4">
            {[
              { label: 'Activity Name', value: activity.name },
              { label: 'Type', value: activity.type },
              { label: 'Time', value: activity.time || '—' },
              { label: 'Estimated Cost', value: activity.cost > 0 ? `$${activity.cost}` : '—' },
              { label: 'Notes', value: activity.notes || '—' },
              { label: 'Description', value: activity.description || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex gap-3 text-sm border-b pb-3 last:border-0 last:pb-0">
                <span className="font-medium text-gray-500 w-36 flex-shrink-0">{label}</span>
                <span className="text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
