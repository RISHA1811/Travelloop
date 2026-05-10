import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const THEMES = [
  { key: 'indigo', label: 'Indigo', color: 'bg-indigo-600' },
  { key: 'violet', label: 'Violet', color: 'bg-violet-600' },
  { key: 'blue', label: 'Blue', color: 'bg-blue-600' },
  { key: 'teal', label: 'Teal', color: 'bg-teal-600' },
  { key: 'rose', label: 'Rose', color: 'bg-rose-600' },
];

const CURRENCIES = ['USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)', 'JPY (¥)', 'AUD (A$)', 'CAD (C$)'];

export default function ProfileSettings() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Profile');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('traveloop_settings') || '{}'));

  const notify = (m, isError = false) => {
    if (isError) { setError(m); setMsg(''); }
    else { setMsg(m); setError(''); }
    setTimeout(() => { setMsg(''); setError(''); }, 3000);
  };

  const notifyPw = (m, isError = false) => {
    if (isError) { setPwError(m); setPwMsg(''); }
    else { setPwMsg(m); setPwError(''); }
    setTimeout(() => { setPwMsg(''); setPwError(''); }, 4000);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name });
      login(localStorage.getItem('token'), { ...user, name: data.name });
      notify('Profile updated successfully!');
    } catch (err) {
      notify(err.response?.data?.message || 'Update failed', true);
    } finally {
      setProfileLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwMsg('');
    if (!currentPassword) return notifyPw('Please enter your current password', true);
    if (newPassword.length < 6) return notifyPw('New password must be at least 6 characters', true);
    if (newPassword !== confirmPassword) return notifyPw('Passwords do not match', true);
    setPwLoading(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      notifyPw('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      notifyPw(err.response?.data?.message || 'Password update failed. Check your current password.', true);
    } finally {
      setPwLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      await api.delete('/auth/account');
      localStorage.removeItem('traveloop_settings');
      logout();
      navigate('/landing', { replace: true });
    } catch (err) {
      setShowDeleteModal(false);
      notify(err.response?.data?.message || 'Failed to delete account', true);
    } finally {
      setDeleteLoading(false);
    }
  };

  const saveSetting = (key, value) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    localStorage.setItem('traveloop_settings', JSON.stringify(updated));
  };

  const TABS = ['Profile', 'Security', 'Settings', 'Notifications'];

  return (
    <Layout>
      <div className="p-6 max-w-3xl mx-auto">
        <PageHeader title="Account" subtitle="Manage your profile and preferences" />

        {msg && <div className="mb-4 bg-green-50 text-green-700 text-sm p-3 rounded-xl">✓ {msg}</div>}
        {error && <div className="mb-4 bg-red-50 text-red-600 text-sm p-3 rounded-xl">✕ {error}</div>}

        {/* Profile hero */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 mb-5 flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-indigo-200 text-sm">{user?.email}</p>
            {user?.role === 'admin' && <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow mb-5">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 text-sm py-2 px-3 rounded-lg font-medium transition ${tab === t ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          {/* Profile Tab */}
          {tab === 'Profile' && (
            <form onSubmit={updateProfile} className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-2">Personal Information</h3>
              <div>
                <label className="label">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input w-full" required />
              </div>
              <div>
                <label className="label">Email</label>
                <input value={user?.email} disabled className="input w-full bg-gray-50 text-gray-400 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="label">Bio (optional)</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                  placeholder="Tell us about yourself..." className="input w-full resize-none" />
              </div>
              <button type="submit" disabled={profileLoading} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {profileLoading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  : 'Save Profile'}
              </button>
            </form>
          )}

          {/* Security Tab */}
          {tab === 'Security' && (
            <form onSubmit={updatePassword} className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-1">Change Password</h3>
              <p className="text-xs text-gray-400 mb-3">
                Logged in as <span className="font-semibold text-indigo-600">{user?.email}</span>
              </p>

              {pwError && (
                <div className="flex flex-col gap-1 text-red-700 text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
                  <div className="flex items-center gap-2"><span>⚠</span> {pwError}</div>
                  {pwError.includes('incorrect') && (
                    <a href="/forgot-password"
                      className="text-xs text-indigo-600 hover:underline mt-1 ml-5">
                      Forgot your password? Reset it here →
                    </a>
                  )}
                </div>
              )}
              {pwMsg && (
                <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 p-3 rounded-xl">
                  <span>✓</span> {pwMsg}
                </div>
              )}

              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="input w-full"
                  required
                />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {newPassword && confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={pwLoading || (newPassword && confirmPassword && newPassword !== confirmPassword)}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {pwLoading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</>
                  : 'Update Password'}
              </button>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-700 mb-3">Active Sessions</h4>
                <div className="flex items-center justify-between bg-green-50 rounded-xl p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Current Session</p>
                    <p className="text-xs text-gray-400">Browser · Active now</p>
                  </div>
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Active</span>
                </div>
              </div>
            </form>
          )}

          {/* Settings Tab */}
          {tab === 'Settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Appearance</h3>
                <label className="label">Theme Color</label>
                <div className="flex gap-3 flex-wrap">
                  {THEMES.map((t) => (
                    <button key={t.key} onClick={() => saveSetting('theme', t.key)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition ${settings.theme === t.key ? 'border-indigo-500' : 'border-transparent hover:border-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full ${t.color}`} />
                      <span className="text-sm">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Preferences</h3>
                <div className="space-y-3">
                  <div>
                    <label className="label">Default Currency</label>
                    <select value={settings.currency || 'USD ($)'} onChange={(e) => saveSetting('currency', e.target.value)} className="input w-full">
                      {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Date Format</label>
                    <select value={settings.dateFormat || 'YYYY-MM-DD'} onChange={(e) => saveSetting('dateFormat', e.target.value)} className="input w-full">
                      <option>YYYY-MM-DD</option>
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                    </select>
                  </div>
                  {[
                    { key: 'compactView', label: 'Compact trip cards' },
                    { key: 'autoSave', label: 'Auto-save changes' },
                    { key: 'showBudget', label: 'Show budget on trip cards' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-gray-700">{label}</span>
                      <div onClick={() => saveSetting(key, !settings[key])}
                        className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${settings[key] ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-700 mb-1">Danger Zone</h3>
                <p className="text-xs text-gray-400 mb-3">Once deleted, your account and all trips are permanently removed.</p>
                <button
                  onClick={() => { setShowDeleteModal(true); setDeleteConfirmText(''); }}
                  className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition font-medium">
                  🗑️ Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {tab === 'Notifications' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-2">Notification Preferences</h3>
              {[
                { key: 'notif_trip_reminder', label: 'Trip reminders', desc: 'Get reminded before your trip starts' },
                { key: 'notif_budget_alert', label: 'Budget alerts', desc: 'Alert when budget exceeds limit' },
                { key: 'notif_packing', label: 'Packing reminders', desc: 'Remind to complete packing checklist' },
                { key: 'notif_share', label: 'Share activity', desc: 'Notify when someone views your shared trip' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <div onClick={() => saveSetting(key, !settings[key])}
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${settings[key] ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow mt-0.5 transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl flex-shrink-0">
                🗑️
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Delete Account</h3>
                <p className="text-xs text-gray-400">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
              <p className="text-sm text-red-700 font-medium">This will permanently delete:</p>
              <ul className="text-sm text-red-600 mt-1 space-y-0.5 list-disc list-inside">
                <li>Your account and profile</li>
                <li>All your trips and itineraries</li>
                <li>All budget data and journals</li>
              </ul>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type <span className="font-bold text-red-600">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 w-full"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-200 transition">
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                className="flex-1 bg-red-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {deleteLoading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Deleting...</>
                  : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
