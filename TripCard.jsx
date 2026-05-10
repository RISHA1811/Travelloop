import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  upcoming: 'bg-blue-100 text-blue-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
};

const COVER_GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-pink-500 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-500',
  'from-green-400 to-emerald-500',
  'from-blue-500 to-indigo-500',
];

function getTripStatus(startDate, endDate) {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (!startDate) return 'upcoming';
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
}

function getCountdown(startDate) {
  if (!startDate) return null;
  const diff = Math.ceil((new Date(startDate) - new Date()) / (1000 * 60 * 60 * 24));
  if (diff > 0) return `${diff}d to go`;
  if (diff === 0) return 'Today!';
  return null;
}

export default function TripCard({ trip, onDelete }) {
  const status = getTripStatus(trip.startDate, trip.endDate);
  const countdown = getCountdown(trip.startDate);
  const gradient = COVER_GRADIENTS[(trip.name?.charCodeAt(0) || 0) % COVER_GRADIENTS.length];
  const budgetTotal = trip.budget?.reduce((s, b) => s + b.cost, 0) || 0;
  const packedCount = trip.packing?.filter((p) => p.packed).length || 0;
  const limit = trip.budgetLimit;
  const isOverBudget = limit && budgetTotal > limit;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col border border-gray-100 hover:-translate-y-0.5 group">
      {/* Cover */}
      <div className={`bg-gradient-to-br ${gradient} h-24 flex items-center justify-between px-5 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 text-8xl flex items-center justify-center select-none">
          {trip.coverEmoji || '✈️'}
        </div>
        <span className="text-white text-4xl relative z-10 drop-shadow">{trip.coverEmoji || '✈️'}</span>
        <div className="flex flex-col items-end gap-1.5 relative z-10">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[status]}`}>
            {status}
          </span>
          {countdown && status === 'upcoming' && (
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">{countdown}</span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-base font-bold text-gray-800 leading-tight group-hover:text-indigo-700 transition">{trip.name}</h3>
        {(trip.startDate || trip.endDate) && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <span>📅</span> {trip.startDate} → {trip.endDate}
          </p>
        )}
        <p className="text-sm text-gray-500 line-clamp-2 flex-1">{trip.description || 'No description'}</p>

        {/* Budget progress */}
        {limit && (
          <div className="pt-1">
            <div className="flex justify-between text-xs mb-1">
              <span className={isOverBudget ? 'text-red-500 font-medium' : 'text-gray-400'}>
                {isOverBudget ? '🚨 Over budget' : '💰 Budget'}
              </span>
              <span className={`font-semibold ${isOverBudget ? 'text-red-500' : 'text-gray-600'}`}>
                ${budgetTotal.toFixed(0)} / ${parseFloat(limit).toFixed(0)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${isOverBudget ? 'bg-red-500' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min((budgetTotal / limit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Mini stats */}
        <div className="flex gap-3 text-xs text-gray-400 pt-1 border-t mt-1 flex-wrap">
          {budgetTotal > 0 && !limit && <span>💰 ${budgetTotal.toFixed(0)}</span>}
          {trip.itinerary?.length > 0 && <span>📍 {trip.itinerary.length} stops</span>}
          {trip.packing?.length > 0 && <span>🧳 {packedCount}/{trip.packing.length}</span>}
        </div>

        <div className="flex gap-2 pt-2">
          <Link to={`/trip/${trip.id}`}
            className="flex-1 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm py-2 rounded-xl hover:opacity-90 transition font-medium shadow-sm shadow-indigo-200">
            Open Trip
          </Link>
          <button onClick={() => onDelete(trip.id)}
            className="px-3 text-center bg-red-50 text-red-400 text-sm py-2 rounded-xl hover:bg-red-100 hover:text-red-600 transition">
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
