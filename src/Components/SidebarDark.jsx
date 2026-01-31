import React, { useState } from 'react';
import { FiHome, FiAlertOctagon, FiSettings, FiChevronLeft, FiChevronRight, FiUsers, FiFolder, FiClock, FiZap, FiPieChart } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebaseConfig';

const NavItem = ({ open, icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
    className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
      active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-300 hover:bg-white/10 hover:text-slate-100'
    }`}
  >
    <span className="shrink-0 transition group-hover:scale-110">{icon}</span>
    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${open ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>{label}</span>
  </button>
);

export default function SidebarDark() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const user = auth.currentUser;
  if (!user) return null;
  const uid = user.uid;

  const menu = [
    { name: 'Home', icon: <FiHome size={18} />, path: `/${uid}/dashboard` },
    { name: 'Bugs', icon: <FiAlertOctagon size={18} />, path: `/${uid}/mybugs` },
    { name: 'Projects', icon: <FiFolder size={18} />, path: `/${uid}/projects` },
    { name: 'Time Tracking', icon: <FiClock size={18} />, path: `/${uid}/time-tracking` },
    { name: 'Workflows', icon: <FiZap size={18} />, path: `/${uid}/workflows` },
    { name: 'Reports', icon: <FiPieChart size={18} />, path: `/${uid}/reports` },
    { name: 'Team', icon: <FiUsers size={18} />, path: `/${uid}/team` },
    { name: 'Settings', icon: <FiSettings size={18} />, path: `/${uid}/settings` },
  ];

  return (
    <aside className={`sticky top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200 flex flex-col transition-all duration-300 border-r border-slate-800 ${open ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between px-4 py-6 border-b border-slate-800">
        <div className={`flex items-center gap-3 ${open ? 'justify-start' : 'justify-center'}`}>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-md">
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 12L22 26V42L32 54L42 42V26L32 12Z" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <div className={`${open ? 'block' : 'hidden'}`}>
            <h2 className="text-lg font-semibold">BugTracker</h2>
            <p className="text-xs text-slate-400">Team Workspace</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
          className="text-slate-300 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          {open ? <FiChevronLeft /> : <FiChevronRight />}
        </button>
      </div>

      <nav className="px-2 py-4 space-y-1 flex-1" role="navigation" aria-label="Main navigation">
        {menu.map((m) => {
          const isActive = m.path && location.pathname === m.path;
          return (
            <NavItem
              key={m.name}
              open={open}
              icon={m.icon}
              label={m.name}
              active={isActive}
              onClick={() => m.path && navigate(m.path)}
            />
          );
        })}
      </nav>

      <div className="px-4 pb-6">
        <div className="bg-slate-800/40 border border-slate-700/50 p-3 rounded-lg backdrop-blur-sm transition-all hover:bg-slate-800/60">
          <p className="text-xs text-slate-400 truncate" title={user.email}>{user.email}</p>
          <p className={`text-sm font-medium text-slate-200 mt-1 ${open ? 'block' : 'hidden'}`}>Pro Plan</p>
        </div>
      </div>
    </aside>
  );
}
