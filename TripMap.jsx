import { useEffect, useState } from 'react';

// City coordinates database
const CITY_COORDS = {
  'Paris': { lat: 48.8566, lng: 2.3522, country: 'France' },
  'Tokyo': { lat: 35.6762, lng: 139.6503, country: 'Japan' },
  'New York': { lat: 40.7128, lng: -74.0060, country: 'USA' },
  'London': { lat: 51.5074, lng: -0.1278, country: 'UK' },
  'Dubai': { lat: 25.2048, lng: 55.2708, country: 'UAE' },
  'Barcelona': { lat: 41.3851, lng: 2.1734, country: 'Spain' },
  'Rome': { lat: 41.9028, lng: 12.4964, country: 'Italy' },
  'Bangkok': { lat: 13.7563, lng: 100.5018, country: 'Thailand' },
  'Singapore': { lat: 1.3521, lng: 103.8198, country: 'Singapore' },
  'Amsterdam': { lat: 52.3676, lng: 4.9041, country: 'Netherlands' },
  'Sydney': { lat: -33.8688, lng: 151.2093, country: 'Australia' },
  'Istanbul': { lat: 41.0082, lng: 28.9784, country: 'Turkey' },
  'Berlin': { lat: 52.5200, lng: 13.4050, country: 'Germany' },
  'Prague': { lat: 50.0755, lng: 14.4378, country: 'Czech Republic' },
  'Vienna': { lat: 48.2082, lng: 16.3738, country: 'Austria' },
  'Delhi': { lat: 28.6139, lng: 77.2090, country: 'India' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, country: 'India' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, country: 'USA' },
  'San Francisco': { lat: 37.7749, lng: -122.4194, country: 'USA' },
  'Miami': { lat: 25.7617, lng: -80.1918, country: 'USA' },
};

export default function TripMap({ itinerary, currentLocation }) {
  const [userLocation, setUserLocation] = useState(currentLocation || null);
  const [loading, setLoading] = useState(!currentLocation);

  useEffect(() => {
    if (!currentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLoading(false);
        },
        () => {
          setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
          setLoading(false);
        }
      );
    }
  }, [currentLocation]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const destinations = (itinerary || [])
    .map(city => {
      const coords = CITY_COORDS[city.city] || CITY_COORDS[city.city.split(' (')[0]];
      return coords ? { ...city, ...coords } : null;
    })
    .filter(Boolean);

  if (destinations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-xl">🗺️</span> Trip Route Map
        </h3>
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-4xl mb-3">📍</p>
          <p className="text-gray-500 text-sm">Add cities to your itinerary to see the route map</p>
        </div>
      </div>
    );
  }

  const allPoints = userLocation ? [userLocation, ...destinations] : destinations;
  const minLat = Math.min(...allPoints.map(p => p.lat)) - 5;
  const maxLat = Math.max(...allPoints.map(p => p.lat)) + 5;
  const minLng = Math.min(...allPoints.map(p => p.lng)) - 5;
  const maxLng = Math.max(...allPoints.map(p => p.lng)) + 5;

  const projectPoint = (lat, lng) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x, y };
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  const totalDistance = destinations.reduce((sum, dest, i) => {
    if (i === 0 && userLocation) {
      return sum + calculateDistance(userLocation.lat, userLocation.lng, dest.lat, dest.lng);
    } else if (i > 0) {
      return sum + calculateDistance(destinations[i-1].lat, destinations[i-1].lng, dest.lat, dest.lng);
    }
    return sum;
  }, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="text-xl">🗺️</span> Trip Route Map
        </h3>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total Distance</p>
          <p className="text-lg font-bold text-indigo-600">{totalDistance.toLocaleString()} km</p>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-8 h-96 overflow-hidden border-2 border-indigo-100">
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {/* Draw route lines */}
          {userLocation && destinations.length > 0 && (() => {
            const start = projectPoint(userLocation.lat, userLocation.lng);
            const end = projectPoint(destinations[0].lat, destinations[0].lng);
            return (
              <line
                x1={`${start.x}%`} y1={`${start.y}%`}
                x2={`${end.x}%`} y2={`${end.y}%`}
                stroke="url(#gradient1)"
                strokeWidth="3"
                strokeDasharray="8,4"
                className="animate-pulse"
              />
            );
          })()}
          {destinations.map((dest, i) => {
            if (i === 0) return null;
            const prev = projectPoint(destinations[i-1].lat, destinations[i-1].lng);
            const curr = projectPoint(dest.lat, dest.lng);
            return (
              <line
                key={i}
                x1={`${prev.x}%`} y1={`${prev.y}%`}
                x2={`${curr.x}%`} y2={`${curr.y}%`}
                stroke="url(#gradient2)"
                strokeWidth="3"
              />
            );
          })}
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Current location marker */}
        {userLocation && (() => {
          const pos = projectPoint(userLocation.lat, userLocation.lng);
          return (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: 10 }}
            >
              <div className="relative group">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-lg shadow-xl ring-4 ring-white">
                  📍
                </div>
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
                  Your Location
                </div>
              </div>
            </div>
          );
        })()}

        {/* Destination markers */}
        {destinations.map((dest, i) => {
          const pos = projectPoint(dest.lat, dest.lng);
          return (
            <div
              key={i}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-scale-in"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: 10, animationDelay: `${i * 0.1}s` }}
            >
              <div className="relative group">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-xl ring-4 ring-white">
                  {i + 1}
                </div>
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow-xl">
                  <p className="font-semibold">{dest.city}</p>
                  <p className="text-gray-300">{dest.country}</p>
                  {dest.date && <p className="text-gray-400 text-xs mt-1">{dest.date}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white">📍</div>
          <span className="text-gray-600">Current Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
          <span className="text-gray-600">Destinations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <span className="text-gray-600">Route</span>
        </div>
      </div>

      {/* City list */}
      <div className="mt-4 pt-4 border-t space-y-2">
        <p className="text-xs font-semibold text-gray-500 mb-2">📍 Route Details:</p>
        {destinations.map((dest, i) => {
          const prevPoint = i === 0 ? userLocation : destinations[i - 1];
          const distance = prevPoint ? calculateDistance(prevPoint.lat, prevPoint.lng, dest.lat, dest.lng) : 0;
          return (
            <div key={i} className="flex items-center justify-between text-xs bg-gradient-to-r from-indigo-50 to-purple-50 p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-gray-800">{dest.city}</p>
                  {dest.date && <p className="text-gray-400 text-xs">{dest.date}</p>}
                </div>
              </div>
              {distance > 0 && (
                <span className="text-indigo-600 font-medium">+{distance.toLocaleString()} km</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
