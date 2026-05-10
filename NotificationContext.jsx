import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

let _id = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addNotification = useCallback((msg, type = 'info', link = null) => {
    const id = ++_id;
    setNotifications((prev) => [{ id, msg, type, link, time: new Date(), read: false }, ...prev]);
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, toasts, addNotification, markAllRead, clearAll, unreadCount }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-slide-up
              ${t.type === 'success' ? 'bg-green-600 text-white' :
                t.type === 'error' ? 'bg-red-600 text-white' :
                t.type === 'warning' ? 'bg-amber-500 text-white' :
                'bg-gray-900 text-white'}`}>
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : t.type === 'warning' ? '⚠' : 'ℹ'}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
