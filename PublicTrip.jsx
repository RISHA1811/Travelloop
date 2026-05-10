import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

export default function PublicTrip() {
  const { shareId } = useParams();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/trips/public/${shareId}`)
      .then(({ data }) => setTrip(data))
      .catch(() => setError('Trip not found or link is invalid.'));
  }, [shareId]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  );

  const total = trip.budget?.reduce((s, b) => s + b.cost, 0) || 0;
  const packed = trip.packing?.filter((p) => p.packed).length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold">✈️ Traveloop</span>
        <span className="text-indigo-200 text-xs bg-indigo-700 px-3 py-1 rounded-full">Read Only</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow">
          <div className="flex items-start gap-4">
            <span className="text-5xl">{trip.coverEmoji || '✈️'}</span>
            <div>
              <h2 className="text-2xl font-bold">{trip.name}</h2>
              {trip.startDate && <p className="text-indigo-200 text-sm mt-1">{trip.startDate} → {trip.endDate}</p>}
              {trip.description && <p className="text-indigo-100 text-sm mt-2">{trip.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/20 text-sm">
            <span>📍 {trip.itinerary?.length || 0} stops</span>
            <span>💰 ${total.toFixed(0)} budget</span>
            <span>🧳 {packed}/{trip.packing?.length || 0} packed</span>
            {trip.collaborators?.length > 0 && <span>👥 {trip.collaborators.length} travellers</span>}
          </div>
        </div>

        {/* Collaborators */}
        {trip.collaborators?.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-4">👥 Travellers</h3>
            <div className="flex flex-wrap gap-3">
              {trip.collaborators.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700">{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        {trip.itinerary?.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-4">📍 Itinerary</h3>
            <div className="space-y-3">
              {trip.itinerary.map((item, idx) => (
                <div key={idx} className="bg-indigo-50 rounded-xl p-4">
                  <p className="font-semibold text-indigo-700">
                    {item.city}
                    {item.date && <span className="text-xs text-gray-500 ml-2">{item.date}</span>}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {item.activities.map((act, i) => <li key={i} className="text-sm text-gray-600">• {act}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget */}
        {trip.budget?.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-4">💰 Budget</h3>
            <table className="w-full text-sm">
              <thead className="bg-indigo-50 text-indigo-700">
                <tr>
                  <th className="text-left px-4 py-2">Item</th>
                  <th className="text-left px-4 py-2">Category</th>
                  <th className="text-right px-4 py-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                {trip.budget.map((b, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{b.item}</td>
                    <td className="px-4 py-2 text-xs text-gray-400">{b.category || 'Other'}</td>
                    <td className="px-4 py-2 text-right">${b.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-indigo-50 font-bold">
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-indigo-700">Total</td>
                  <td className="px-4 py-2 text-right text-indigo-700">${total.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Packing */}
        {trip.packing?.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-3">🧳 Packing List</h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-indigo-500 h-2 rounded-full"
                style={{ width: `${trip.packing.length > 0 ? (packed / trip.packing.length) * 100 : 0}%` }} />
            </div>
            <ul className="space-y-2">
              {trip.packing.map((p, idx) => (
                <li key={idx} className={`flex items-center gap-3 text-sm ${p.packed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  <span>{p.packed ? '✅' : '⬜'}</span> {p.item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {trip.notes && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="font-bold text-gray-700 mb-3">📝 Notes</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{trip.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
