import { useState } from 'react';

const TRIP_TEMPLATES = {
  'Beach Paradise': {
    emoji: '🏖️',
    cities: ['Miami', 'Barcelona', 'Sydney'],
    activities: ['Beach Day', 'Scuba Diving', 'Sunset Cruise', 'Seafood Restaurant'],
    budget: 2500,
    duration: 7,
    description: 'Relax on pristine beaches and enjoy water sports'
  },
  'Cultural Explorer': {
    emoji: '🏛️',
    cities: ['Rome', 'Paris', 'Prague'],
    activities: ['Museum Visit', 'Historical Landmarks', 'Art Gallery', 'Local Restaurant'],
    budget: 3000,
    duration: 10,
    description: 'Immerse yourself in history and art'
  },
  'Adventure Seeker': {
    emoji: '🧗',
    cities: ['Dubai', 'Bangkok', 'Singapore'],
    activities: ['Zip Lining', 'Hiking', 'Safari', 'Paragliding'],
    budget: 3500,
    duration: 12,
    description: 'Thrilling activities and extreme sports'
  },
  'Food Journey': {
    emoji: '🍽️',
    cities: ['Tokyo', 'Bangkok', 'Paris'],
    activities: ['Street Food Tour', 'Cooking Class', 'Fine Dining', 'Food Market Visit'],
    budget: 2800,
    duration: 8,
    description: 'Taste the world\'s best cuisines'
  },
  'City Hopper': {
    emoji: '🌆',
    cities: ['New York', 'London', 'Tokyo'],
    activities: ['City Walking Tour', 'Shopping', 'Theater Show', 'Viewpoint Visit'],
    budget: 4000,
    duration: 14,
    description: 'Experience vibrant urban life'
  },
  'Romantic Getaway': {
    emoji: '💑',
    cities: ['Paris', 'Venice', 'Vienna'],
    activities: ['Dinner Cruise', 'Wine Tasting', 'Spa Treatment', 'Opera'],
    budget: 3200,
    duration: 7,
    description: 'Perfect for couples seeking romance'
  }
};

const SMART_SUGGESTIONS = {
  budget: {
    low: ['Bangkok', 'Prague', 'Istanbul'],
    medium: ['Barcelona', 'Berlin', 'Amsterdam'],
    high: ['Dubai', 'Tokyo', 'Singapore']
  },
  season: {
    summer: ['Barcelona', 'Amsterdam', 'Sydney'],
    winter: ['Dubai', 'Bangkok', 'Singapore'],
    spring: ['Paris', 'Tokyo', 'Rome'],
    fall: ['New York', 'Prague', 'Vienna']
  },
  interests: {
    history: ['Rome', 'Istanbul', 'Prague'],
    nature: ['Sydney', 'Bangkok', 'Vienna'],
    shopping: ['Dubai', 'Tokyo', 'New York'],
    nightlife: ['Barcelona', 'Berlin', 'Bangkok']
  }
};

export default function AITripSuggestions({ onApplyTemplate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [preferences, setPreferences] = useState({ budget: 'medium', season: 'summer', interest: 'history' });
  const [showCustom, setShowCustom] = useState(false);

  const getSmartSuggestions = () => {
    const cities = new Set();
    Object.values(preferences).forEach(pref => {
      const category = Object.keys(SMART_SUGGESTIONS).find(key => 
        SMART_SUGGESTIONS[key][pref]
      );
      if (category) {
        SMART_SUGGESTIONS[category][pref]?.forEach(city => cities.add(city));
      }
    });
    return Array.from(cities).slice(0, 5);
  };

  const smartCities = getSmartSuggestions();

  return (
    <div className="space-y-6">
      {/* AI Smart Suggestions */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🤖</span>
          <h3 className="font-bold text-gray-800">AI-Powered Suggestions</h3>
        </div>
        
        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Budget Range</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map(b => (
                <button
                  key={b}
                  onClick={() => setPreferences({ ...preferences, budget: b })}
                  className={`flex-1 text-xs py-2 rounded-lg font-medium transition ${
                    preferences.budget === b
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {b === 'low' ? '💰 Budget' : b === 'medium' ? '💰💰 Moderate' : '💰💰💰 Luxury'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Best Season</label>
            <div className="grid grid-cols-4 gap-2">
              {['summer', 'winter', 'spring', 'fall'].map(s => (
                <button
                  key={s}
                  onClick={() => setPreferences({ ...preferences, season: s })}
                  className={`text-xs py-2 rounded-lg font-medium transition ${
                    preferences.season === s
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'summer' ? '☀️' : s === 'winter' ? '❄️' : s === 'spring' ? '🌸' : '🍂'} {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Main Interest</label>
            <div className="grid grid-cols-4 gap-2">
              {['history', 'nature', 'shopping', 'nightlife'].map(i => (
                <button
                  key={i}
                  onClick={() => setPreferences({ ...preferences, interest: i })}
                  className={`text-xs py-2 rounded-lg font-medium transition capitalize ${
                    preferences.interest === i
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {i === 'history' ? '🏛️' : i === 'nature' ? '🌿' : i === 'shopping' ? '🛍️' : '🎉'} {i}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
          <p className="text-xs font-semibold text-indigo-700 mb-2">✨ Recommended Destinations:</p>
          <div className="flex flex-wrap gap-2">
            {smartCities.map((city, i) => (
              <span key={i} className="bg-white text-indigo-600 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                📍 {city}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Pre-made Templates */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🎯</span> Trip Templates
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(TRIP_TEMPLATES).map(([name, template]) => (
            <div
              key={name}
              onClick={() => setSelectedTemplate(selectedTemplate === name ? null : name)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                selectedTemplate === name
                  ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{template.emoji}</span>
                  <h4 className="font-bold text-gray-800 text-sm">{name}</h4>
                </div>
                {selectedTemplate === name && (
                  <span className="text-green-500 text-lg">✓</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">{template.description}</p>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📍</span>
                  <span>{template.cities.length} cities</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>📅</span>
                  <span>{template.duration} days</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>💰</span>
                  <span>${template.budget}</span>
                </div>
              </div>
              {selectedTemplate === name && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyTemplate?.(template);
                  }}
                  className="w-full mt-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs py-2 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  Apply Template →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
