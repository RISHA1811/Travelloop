import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import Itinerary from '../components/Itinerary';
import Budget from '../components/Budget';
import Packing from '../components/Packing';
import Notes from '../components/Notes';
import WeatherWidget from '../components/WeatherWidget';
import Collaborators from '../components/Collaborators';
import TripMap from '../components/TripMap';

const TABS = ['Overview', 'Itinerary', 'Budget', 'Packing', 'Notes', 'Weather', 'People', 'Map'];
const EMOJIS = ['✈️', '🏖️', '🏔️', '🗺️', '🌍', '🏕️', '🚢', '🎡', '🗼', '🌴', '🎿', '🏄'];

function getCountdown(startDate, endDate) {
  if (!startDate) return null;
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now > end) return { label: 'Trip completed', color: 'bg-gray-500' };
  const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return { label: '🚀 Trip is ongoing!', color: 'bg-green-500' };
  return { label: `${diff} day${diff !== 1 ? 's' : ''} to go`, color: 'bg-amber-500' };
}

function getTripDuration(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  return diff > 0 ? `${diff} day${diff !== 1 ? 's' : ''}` : null;
}

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [tab, setTab] = useState('Overview');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/trips/${id}`).then(({ data }) => {
      setTrip(data);
      setForm({ name: data.name, startDate: data.startDate, endDate: data.endDate, description: data.description, coverEmoji: data.coverEmoji || '✈️' });
    }).catch(() => navigate('/'));
  }, [id]);

  const save = async (updates = {}) => {
    const payload = { ...trip, ...updates };
    const { data } = await api.put(`/trips/${id}`, payload);
    setTrip(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveOverview = async () => {
    await save(form);
    setEditing(false);
  };

  const shareUrl = `${window.location.origin}/share/${trip?.shareId}`;

  const copyShare = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!trip) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  const countdown = getCountdown(trip.startDate, trip.endDate);
  const duration = getTripDuration(trip.startDate, trip.endDate);
  const budgetTotal = trip.budget?.reduce((s, b) => s + b.cost, 0) || 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 mb-6 shadow">
          <div className="flex justify-between items-start flex-wrap gap-3">
            <div className="flex items-start gap-4">
              <span className="text-5xl">{trip.coverEmoji || '✈️'}</span>
              <div>
                <h2 className="text-2xl font-bold">{trip.name}</h2>
                <div className="flex flex-wrap gap-2 mt-1 items-center">
                  {trip.startDate && <p className="text-indigo-200 text-sm">{trip.startDate} → {trip.endDate}</p>}
                  {duration && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{duration}</span>}
                </div>
                {trip.description && <p className="text-indigo-100 text-sm mt-1">{trip.description}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {countdown && (
                <span className={`${countdown.color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                  {countdown.label}
                </span>
              )}
              <div className="flex gap-2">
                <button onClick={copyShare} className="bg-white text-indigo-600 text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-indigo-50">
                  {copied ? '✓ Copied!' : '🔗 Share'}
                </button>
                {saved && <span className="bg-green-500 text-white text-sm px-3 py-1.5 rounded-full">✓ Saved</span>}
              </div>
            </div>
          </div>

          {/* Quick stats + links */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/20 text-sm">
            <Link to={`/trip/${id}/itinerary`} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition">📍 {trip.itinerary?.length || 0} stops</Link>
            <Link to={`/trip/${id}/budget`} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition">💰 ${budgetTotal.toFixed(0)}</Link>
            <Link to={`/trip/${id}/packing`} className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition">🧳 {trip.packing?.filter(p => p.packed).length || 0}/{trip.packing?.length || 0} packed</Link>
            <span className="bg-white/10 px-3 py-1 rounded-full">👥 {trip.collaborators?.length || 0} travellers</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 text-sm py-2 px-3 rounded-lg font-medium transition whitespace-nowrap ${tab === t ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow p-6">

          {tab === 'Overview' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Trip Details</h3>
                <button onClick={() => setEditing(!editing)} className="text-indigo-500 text-sm hover:underline">
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {editing ? (
                <div className="space-y-3">
                  {/* Emoji picker in edit */}
                  <div>
                    <label className="label">Trip Icon</label>
                    <div className="flex flex-wrap gap-2">
                      {EMOJIS.map((e) => (
                        <button type="button" key={e} onClick={() => setForm({ ...form, coverEmoji: e })}
                          className={`text-xl p-1.5 rounded-lg border-2 transition ${form.coverEmoji === e ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:border-gray-200'}`}>
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input w-full" placeholder="Trip Name" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input w-full" />
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input w-full" />
                  </div>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input w-full resize-none" rows={3} />
                  <button onClick={saveOverview} className="btn-primary">Save Changes</button>
                </div>
              ) : (
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-800">Name:</span> {trip.name}</p>
                  <p><span className="font-medium text-gray-800">Dates:</span> {trip.startDate || '—'} → {trip.endDate || '—'}</p>
                  {duration && <p><span className="font-medium text-gray-800">Duration:</span> {duration}</p>}
                  <p><span className="font-medium text-gray-800">Description:</span> {trip.description || '—'}</p>
                  <div className="mt-4 p-3 bg-indigo-50 rounded-xl">
                    <p className="text-xs text-indigo-600 font-medium mb-1">🔗 Public Share Link</p>
                    <p className="text-xs text-gray-500 break-all">{shareUrl}</p>
                    <button onClick={copyShare} className="mt-2 text-xs text-indigo-600 hover:underline">
                      {copied ? '✓ Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'Itinerary' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">📍 Itinerary</h3>
                <div className="flex gap-2">
                  <Link to={`/trip/${id}/itinerary/build`} className="text-xs text-indigo-500 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50">✏️ Builder</Link>
                  <Link to={`/trip/${id}/itinerary`} className="text-xs text-indigo-500 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50">🗺️ Timeline</Link>
                </div>
              </div>
              <Itinerary itinerary={trip.itinerary} onChange={(val) => save({ itinerary: val })} />
            </div>
          )}

          {tab === 'Budget' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">💰 Budget Tracker</h3>
                <Link to={`/trip/${id}/budget`} className="text-xs text-indigo-500 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50">Full View →</Link>
              </div>
              <Budget budget={trip.budget} onChange={(val) => save({ budget: val })} />
            </div>
          )}

          {tab === 'Packing' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">🧳 Packing Checklist</h3>
                <Link to={`/trip/${id}/packing`} className="text-xs text-indigo-500 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50">Full View →</Link>
              </div>
              <Packing packing={trip.packing} onChange={(val) => save({ packing: val })} />
            </div>
          )}

          {tab === 'Notes' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">📝 Notes</h3>
              <Notes notes={trip.notes} onChange={(val) => setTrip({ ...trip, notes: val })} />
              <button onClick={() => save({ notes: trip.notes })} className="btn-primary mt-3">Save Notes</button>
            </div>
          )}

          {tab === 'Weather' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">🌤️ Weather Check</h3>
              <p className="text-sm text-gray-400 mb-4">Check current weather and 5-day forecast for any city on your trip.</p>
              <WeatherWidget />
            </div>
          )}

          {tab === 'People' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">👥 Co-Travellers</h3>
              <Collaborators
                collaborators={trip.collaborators}
                onChange={(val) => save({ collaborators: val })}
              />
            </div>
          )}

          {tab === 'Map' && (
            <div>
              <TripMap itinerary={trip.itinerary} />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
