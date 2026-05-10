import Layout from '../components/Layout';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';

const TYPE_STYLES = {
  success: 'bg-green-50 border-green-200 text-green-700',
  error: 'bg-red-50 border-red-200 text-red-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  info: 'bg-indigo-50 border-indigo-200 text-indigo-700',
};

const TYPE_ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

function timeAgo(date) {
  const diff = Math.floor((new Date() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const { notifications, markAllRead, clearAll, unreadCount } = useNotifications();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-indigo-600 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition">
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                Clear all
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔔</p>
            <p className="text-gray-500 text-lg font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">We'll notify you about trip updates, budget alerts, and more.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition ${TYPE_STYLES[n.type] || TYPE_STYLES.info} ${!n.read ? 'shadow-sm' : 'opacity-70'}`}>
                <div className="w-7 h-7 rounded-full bg-current/10 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] || 'ℹ'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{n.msg}</p>
                  <p className="text-xs opacity-60 mt-1">{timeAgo(n.time)}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-current mt-2 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
