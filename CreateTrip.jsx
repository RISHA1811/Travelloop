import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';

const EMOJIS = ['✈️', '🏖️', '🏔️', '🗺️', '🌍', '🏕️', '🚢', '🎡', '🗼', '🌴', '🎿', '🏄'];

export default function CreateTrip() {
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', description: '', coverEmoji: '✈️' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/trips', form);
      navigate(`/trip/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip');
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🗺️ Create New Trip</h2>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">

          {/* Emoji Picker */}
          <div>
            <label className="label">Trip Icon</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button type="button" key={e} onClick={() => setForm({ ...form, coverEmoji: e })}
                  className={`text-2xl p-2 rounded-xl border-2 transition ${form.coverEmoji === e ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:border-gray-200'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Trip Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Europe Summer 2025" className="input w-full" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input w-full" />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input w-full" />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What's this trip about?" rows={3} className="input w-full resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Create Trip</button>
            <button type="button" onClick={() => navigate('/')} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-xl hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
