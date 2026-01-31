import React, { useEffect, useState } from 'react';
import { FiBell, FiSearch, FiSettings } from 'react-icons/fi';
import { auth } from '../firebaseConfig';
import NotificationCenter from './Advanced/NotificationCenter';
import { subscribeToNotifications } from '../services/notificationService';
import { useUIContext } from '../contexts/UIContext';
import { useNavigate } from 'react-router-dom';

export default function TopHeader({ title }) {
  const user = auth.currentUser;
  const name = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { searchQuery, setSearchQuery } = useUIContext();
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToNotifications(user.uid, (notes) => setNotifications(notes));
    return () => unsub && unsub();
  }, [user]);

  const handleSettings = () => {
    if (user?.uid) navigate(`/${user.uid}/settings`);
    else navigate('/settings');
  };

  return (
    <header className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Welcome {name}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          {!showSearch ? (
            <button aria-label="Search" onClick={() => setShowSearch(true)} className="p-2.5 rounded-md bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all hover:shadow-sm">
              <FiSearch size={18} />
            </button>
          ) : (
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => setShowSearch(false)}
              placeholder="Search bugs..."
              className="px-3 py-2 rounded-md border border-slate-200 w-64 focus:outline-none"
            />
          )}
        </div>
        <div className="relative">
          <button aria-label="Notifications" onClick={() => setOpen((v) => !v)} className="p-2.5 rounded-md bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all hover:shadow-sm relative">
            <FiBell size={18} />
            {notifications.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>}
          </button>
          {open && <NotificationCenter notifications={notifications} onClose={(id) => setNotifications((prev) => prev.filter(n => n.id !== id))} />}
        </div>
        <button aria-label="Settings" onClick={handleSettings} className="p-2.5 rounded-md bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200 transition-all hover:shadow-sm">
          <FiSettings size={18} />
        </button>
      </div>
    </header>
  );
}
