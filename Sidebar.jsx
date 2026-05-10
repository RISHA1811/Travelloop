import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const NAV = [
  { to: '/', icon: '🏠', label: 'Dashboard' },
  { to: '/my-trips', icon: '🗺️', label: 'My Trips' },
  { to: '/create', icon: '➕', label: 'Create Trip' },
  { to: '/budget-planner', icon: '💰', label: 'Budget Planner' },
  { to: '/journal', icon: '📔', label: 'Journal' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { data } = await api.get('/trips');
        const notifs = [];
        const now = new Date();
        data.forEach(trip => {
          if (trip.startDate) {
            const start = new Date(trip.startDate);
            const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
            if (diff > 0 && diff <= 7) {
              notifs.push({ id: trip.id, type: 'upcoming', message: `${trip.name} starts in ${diff} day${diff !== 1 ? 's' : ''}!`, trip });
            } else if (diff === 0) {
              notifs.push({ id: trip.id, type: 'today', message: `${trip.name} starts today! 🎉`, trip });
            }
          }
          const incomplete = (trip.packing || []).filter(p => !p.packed).length;
          if (incomplete > 0 && trip.startDate) {
            const start = new Date(trip.startDate);
            const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
            if (diff >= 0 && diff <= 3) {
              notifs.push({ id: `${trip.id}-pack`, type: 'packing', message: `${incomplete} items left to pack for ${trip.name}`, trip });
            }
          }
        });
        setNotifications(notifs);
      } catch (err) {}
    };
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col shadow-xl fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-3xl transform group-hover:scale-110 transition-transform">✈️</span>
          <span className="text-xl font-bold gradient-text">Traveloop</span>
        </Link>
      </div>

      {/* Notifications */}
      <div className="px-3 py-3 border-b border-gray-100">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-indigo-50 transition group relative"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <span className="text-sm font-medium text-gray-700">Notifications</span>
          </div>
          {notifications.length > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
              {notifications.length}
            </span>
          )}
        </button>
        {showNotifications && (
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">No new notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => navigate(`/trip/${notif.trip.id}`)}
                  className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg text-xs cursor-pointer hover:shadow-md transition border border-indigo-100"
                >
                  <p className="text-gray-700 font-medium">{notif.message}</p>
                  <p className="text-gray-400 text-xs mt-1">Click to view trip</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
                active 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200' 
                  : 'text-gray-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700'
              }`}>
              <span className={`text-lg transform transition-transform ${active ? '' : 'group-hover:scale-110'}`}>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}

        {/* Admin link */}
        {user?.role === 'admin' && (
          <Link to="/admin"
            className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group ${
              location.pathname === '/admin' 
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-200' 
                : 'text-red-500 hover:bg-red-50'
            }`}>
            <span className="text-lg transform transition-transform group-hover:scale-110">🛡️</span>
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-indigo-50/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full text-xs text-gray-500 hover:text-red-500 text-left transition-colors flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-red-50">
          <span>→</span> Logout
        </button>
      </div>
    </aside>
  );
}
