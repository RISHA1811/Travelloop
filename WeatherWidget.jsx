import { useState } from 'react';

const WMO_CODES = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Foggy', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  61: { label: 'Light rain', icon: '🌧️' },
  63: { label: 'Moderate rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
};

export default function WeatherWidget() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      // Geocode city name
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.results?.length) throw new Error('City not found');

      const { latitude, longitude, name, country } = geoData.results[0];

      // Fetch weather
      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=5`
      );
      const wData = await wRes.json();
      setWeather({ ...wData, cityName: name, country });
    } catch (e) {
      setError(e.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  const current = weather?.current_weather;
  const daily = weather?.daily;
  const wmo = WMO_CODES[current?.weathercode] || { label: 'Unknown', icon: '🌡️' };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Enter city name..."
          className="input flex-1" onKeyDown={(e) => e.key === 'Enter' && fetchWeather()} />
        <button onClick={fetchWeather} className="btn-primary" disabled={loading}>
          {loading ? '...' : 'Check'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {weather && current && (
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg">{weather.cityName}, {weather.country}</p>
              <p className="text-blue-200 text-sm">{wmo.label}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl">{wmo.icon}</p>
              <p className="text-2xl font-bold">{current.temperature}°C</p>
            </div>
          </div>

          {/* 5-day forecast */}
          {daily && (
            <div className="grid grid-cols-5 gap-1 pt-2 border-t border-white/20">
              {daily.time.slice(0, 5).map((date, i) => {
                const code = daily.weathercode[i];
                const icon = (WMO_CODES[code] || { icon: '🌡️' }).icon;
                return (
                  <div key={date} className="text-center">
                    <p className="text-xs text-blue-200">{new Date(date).toLocaleDateString('en', { weekday: 'short' })}</p>
                    <p className="text-lg">{icon}</p>
                    <p className="text-xs font-semibold">{Math.round(daily.temperature_2m_max[i])}°</p>
                    <p className="text-xs text-blue-300">{Math.round(daily.temperature_2m_min[i])}°</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
