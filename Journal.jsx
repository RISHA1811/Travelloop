import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const MOODS = ['😄', '😊', '😐', '😔', '😴', '🤩', '😎', '🥰'];

export default function Journal() {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', mood: '😊', date: new Date().toISOString().split('T')[0] });
  const [editIdx, setEditIdx] = useState(null);
  const [saved, setSaved] = useState(false);
  const [expandedEntry, setExpandedEntry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/trips').then(({ data }) => {
      setTrips(data);
      if (data.length > 0) {
        setSelectedTrip(data[0].id);
        setEntries(data[0].journal || []);
      }
    });
  }, []);

  const handleTripChange = (tripId) => {
    setSelectedTrip(tripId);
    const trip = trips.find((t) => t.id === tripId);
    setEntries(trip?.journal || []);
    setEditIdx(null);
  };

  const saveEntries = async (updated) => {
    const trip = trips.find((t) => t.id === selectedTrip);
    const { data } = await api.put(`/trips/${selectedTrip}`, { ...trip, journal: updated });
    setTrips((prev) => prev.map((t) => t.id === selectedTrip ? data : t));
    setEntries(data.journal || []);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addEntry = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const entry = { id: Date.now().toString(), ...form, createdAt: new Date().toISOString() };
    saveEntries([entry, ...entries]);
    setForm({ title: '', content: '', mood: '😊', date: new Date().toISOString().split('T')[0] });
  };

  const saveEdit = () => {
    saveEntries(entries.map((e, i) => i === editIdx ? { ...e, ...form } : e));
    setEditIdx(null);
    setForm({ title: '', content: '', mood: '😊', date: new Date().toISOString().split('T')[0] });
  };

  const deleteEntry = (idx) => {
    if (!confirm('Delete this journal entry?')) return;
    saveEntries(entries.filter((_, i) => i !== idx));
  };

  const startEdit = (idx) => {
    setEditIdx(idx);
    setForm({ title: entries[idx].title, content: entries[idx].content, mood: entries[idx].mood, date: entries[idx].date });
  };

  const currentTrip = trips.find((t) => t.id === selectedTrip);

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <PageHeader
          title="📔 Travel Journal"
          subtitle="Document your travel memories"
          actions={saved && <span className="text-green-600 text-sm bg-green-50 px-3 py-1.5 rounded-lg">✓ Saved</span>}
        />

        {trips.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow text-gray-400">
            <p className="text-5xl mb-4">📔</p>
            <p className="text-lg">No trips yet. Create a trip to start journaling!</p>
          </div>
        ) : (
          <>
            {/* Trip selector */}
            <div className="bg-white rounded-2xl shadow p-4 mb-5 flex items-center gap-3 flex-wrap">
              <label className="text-sm font-medium text-gray-600">Journal for:</label>
              <select value={selectedTrip} onChange={(e) => handleTripChange(e.target.value)} className="input flex-1">
                {trips.map((t) => <option key={t.id} value={t.id}>{t.coverEmoji || '✈️'} {t.name}</option>)}
              </select>
              {currentTrip && (
                <span className="text-xs text-gray-400">{entries.length} entr{entries.length !== 1 ? 'ies' : 'y'}</span>
              )}
            </div>

            {/* Add / Edit entry form */}
            <div className="bg-white rounded-2xl shadow p-5 mb-5">
              <h3 className="font-semibold text-gray-700 mb-4">{editIdx !== null ? '✏️ Edit Entry' : '✍️ New Entry'}</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Entry title *" className="input sm:col-span-2" />
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
                </div>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write about your day, experiences, feelings..." rows={4}
                  className="input w-full resize-none" />
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-600">Mood:</span>
                  {MOODS.map((m) => (
                    <button key={m} type="button" onClick={() => setForm({ ...form, mood: m })}
                      className={`text-xl p-1 rounded-lg transition ${form.mood === m ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'hover:bg-gray-100'}`}>
                      {m}
                    </button>
                  ))}
                  <div className="ml-auto flex gap-2">
                    {editIdx !== null && (
                      <button onClick={() => { setEditIdx(null); setForm({ title: '', content: '', mood: '😊', date: new Date().toISOString().split('T')[0] }); }}
                        className="border border-gray-300 text-gray-600 text-sm px-4 py-2 rounded-xl hover:bg-gray-50">
                        Cancel
                      </button>
                    )}
                    <button onClick={editIdx !== null ? saveEdit : addEntry} className="btn-primary">
                      {editIdx !== null ? 'Save Changes' : 'Add Entry'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Entries list */}
            {entries.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow text-gray-400">
                <p className="text-4xl mb-3">✍️</p>
                <p>No journal entries yet. Write your first memory!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry, idx) => (
                  <div key={entry.id || idx} className="bg-white rounded-2xl shadow overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{entry.mood}</span>
                          <div>
                            <h4 className="font-bold text-gray-800">{entry.title}</h4>
                            <p className="text-xs text-gray-400">{entry.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => startEdit(idx)} className="text-xs text-indigo-500 hover:underline">Edit</button>
                          <button onClick={() => deleteEntry(idx)} className="text-xs text-red-400 hover:underline">Delete</button>
                          <button onClick={() => setExpandedEntry(expandedEntry === idx ? null : idx)}
                            className="text-xs text-gray-400 hover:text-gray-600">
                            {expandedEntry === idx ? '▲' : '▼'}
                          </button>
                        </div>
                      </div>
                      {expandedEntry === idx ? (
                        <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{entry.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
