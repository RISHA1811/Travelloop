import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link to="/" className="text-xl font-bold tracking-wide">✈️ Traveloop</Link>
      {user && (
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm hover:underline hidden sm:block">My Trips</Link>
          <Link to="/create" className="bg-white text-indigo-600 text-sm font-semibold px-3 py-1 rounded-full hover:bg-indigo-50 hidden sm:block">
            + New Trip
          </Link>
          <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm hidden sm:block">{user.name}</span>
          </Link>
          <button onClick={handleLogout} className="text-sm hover:underline opacity-70">Logout</button>
        </div>
      )}
    </nav>
  );
}
