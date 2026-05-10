import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const updateName = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const { data } = await api.put('/auth/profile', { name });
      login(localStorage.getItem('token'), { ...user, name: data.name });
      setMsg('Name updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setMsg('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Password update failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 My Profile</h2>

        {msg && <p className="text-green-600 text-sm mb-4 bg-green-50 p-3 rounded-lg">✓ {msg}</p>}
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg">{error}</p>}

        {/* Avatar */}
        <div className="bg-white rounded-2xl shadow p-6 mb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg">{user?.name}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Update Name */}
        <div className="bg-white rounded-2xl shadow p-6 mb-4">
          <h3 className="font-semibold text-gray-700 mb-4">Update Name</h3>
          <form onSubmit={updateName} className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Full Name" className="input w-full" required />
            <button type="submit" className="btn-primary">Save Name</button>
          </form>
        </div>

        {/* Update Password */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Change Password</h3>
          <form onSubmit={updatePassword} className="space-y-3">
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password" className="input w-full" required />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password" className="input w-full" required />
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </div>

        <button onClick={() => navigate('/')} className="mt-4 text-sm text-gray-400 hover:underline">← Back to Dashboard</button>
      </div>
    </div>
  );
}
