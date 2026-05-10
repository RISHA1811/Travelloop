import { useState } from 'react';

export default function Itinerary({ itinerary = [], onChange }) {
  const [city, setCity] = useState('');
  const [date, setDate] = useState('');
  const [activity, setActivity] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const addCity = () => {
    if (!city.trim()) return;
    onChange([...itinerary, { city, date, activities: [] }]);
    setCity('');
    setDate('');
  };

  const addActivity = (idx) => {
    if (!activity.trim()) return;
    const updated = itinerary.map((item, i) =>
      i === idx ? { ...item, activities: [...item.activities, activity] } : item
    );
    onChange(updated);
    setActivity('');
    setSelectedCity('');
  };

  const removeCity = (idx) => onChange(itinerary.filter((_, i) => i !== idx));

  const removeActivity = (cityIdx, actIdx) => {
    const updated = itinerary.map((item, i) =>
      i === cityIdx ? { ...item, activities: item.activities.filter((_, j) => j !== actIdx) } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City / Stop" className="input flex-1" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
        <button onClick={addCity} className="btn-primary">Add City</button>
      </div>

      {itinerary.map((item, idx) => (
        <div key={idx} className="bg-indigo-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-indigo-700">📍 {item.city} {item.date && <span className="text-xs text-gray-500 ml-2">{item.date}</span>}</h4>
            <button onClick={() => removeCity(idx)} className="text-red-400 text-xs hover:text-red-600">Remove</button>
          </div>
          <ul className="space-y-1">
            {item.activities.map((act, aIdx) => (
              <li key={aIdx} className="flex justify-between text-sm bg-white px-3 py-1 rounded-lg">
                <span>• {act}</span>
                <button onClick={() => removeActivity(idx, aIdx)} className="text-red-400 text-xs">✕</button>
              </li>
            ))}
          </ul>
          {selectedCity === idx ? (
            <div className="flex gap-2">
              <input value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="Add activity" className="input flex-1" />
              <button onClick={() => addActivity(idx)} className="btn-primary text-sm">Add</button>
              <button onClick={() => setSelectedCity('')} className="text-gray-400 text-sm">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setSelectedCity(idx)} className="text-indigo-500 text-sm hover:underline">+ Add Activity</button>
          )}
        </div>
      ))}
    </div>
  );
}
