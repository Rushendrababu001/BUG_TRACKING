import { useState } from "react";
import {
  FiHome,
  FiAlertOctagon,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiLayers,
  FiPieChart,
  FiUsers,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../firebaseConfig";

const CyberpunkBug = ({ size = 32 }) => (
  <div
    style={{
      width: size,
      height: size,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cyberGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>

      <path
        d="M32 12L22 26V42L32 54L42 42V26L32 12Z"
        stroke="url(#cyberGrad)"
        strokeWidth="3"
      />
      <path
        d="M32 4L26 12H38L32 4Z"
        stroke="url(#cyberGrad)"
        strokeWidth="3"
      />
      <path d="M22 22L6 16" stroke="url(#cyberGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 32L4 32" stroke="url(#cyberGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 42L6 50" stroke="url(#cyberGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 22L58 16" stroke="url(#cyberGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 32L60 32" stroke="url(#cyberGrad)" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 42L58 50" stroke="url(#cyberGrad)" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M32 18V48"
        stroke="url(#cyberGrad)"
        strokeWidth="2"
        strokeDasharray="6 4"
      />
    </svg>
  </div>
);

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const user = auth.currentUser;
  if (!user) return null;

  const uid = user.uid;

  const menuSections = [
    {
      title: "Main Menu",
      items: [
        { name: "Dashboard", icon: <FiHome size={20} />, path: `/${uid}/dashboard` },
        { name: "My Bugs", icon: <FiAlertOctagon size={20} />, path: `/${uid}/mybugs` },
        { name: "Settings", icon: <FiSettings size={20} />, path: `/${uid}/settings` },
      ],
    },
    {
      title: "Team Insights",
      items: [
        { name: "Performance", icon: <FiPieChart size={20} /> },
        { name: "Collaborations", icon: <FiLayers size={20} /> },
        { name: "Employees", icon: <FiUsers size={20} /> },
      ],
    },
  ];

  const handleNavigate = (path) => {
    if (path) navigate(path);
  };

  return (
    <aside
      className={`sticky top-0 h-screen bg-white/90 backdrop-blur border-r border-slate-200 text-slate-800 transition-all duration-300 ease-in-out flex flex-col shadow-sm
      ${open ? "w-72" : "w-24"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-10 z-50 bg-white border border-slate-200 text-slate-600 p-1.5 rounded-full shadow-sm hover:bg-indigo-50 transition"
      >
        {open ? <FiChevronLeft size={16} /> : <FiChevronRight size={16} />}
      </button>

      <div
        className={`flex items-center gap-3 mt-10 mb-8 px-5 transition-all ${open ? "justify-start" : "justify-center"}`}
      >
        <div className="p-2 bg-gradient-to-br from-indigo-100 via-indigo-50 to-white rounded-2xl">
          <CyberpunkBug size={32} />
        </div>
        <div
          className={`flex flex-col transition-all duration-300 whitespace-nowrap overflow-hidden
          ${open ? "w-auto opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-5"}`}
        >
          <h1 className="text-xl font-semibold text-slate-900">Bug Tracker</h1>
          <span className="text-xs text-slate-400">Team Workspace</span>
        </div>
      </div>

      <nav className="flex-1 space-y-8 px-4 pb-6 overflow-hidden">
        {menuSections.map((section) => (
          <div key={section.title}>
            <p
              className={`text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3 transition-all ${
                open ? "opacity-100" : "opacity-0"
              }`}
            >
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = item.path && location.pathname === item.path;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigate(item.path)}
                    className={`group w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                        : "text-slate-600 hover:bg-slate-100/80"
                    } ${!item.path && "cursor-not-allowed opacity-80"}`}
                  >
                    <span className={`shrink-0 ${!open && "mx-auto"}`}>{item.icon}</span>
                    <span
                      className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                        open ? "opacity-100" : "opacity-0 w-0"
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={`px-5 pb-8" ${open ? "w-auto opacity-100 translate-x-0" : "w-0 opacity-0 -translate-x-5"}`}>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-slate-400 mb-2">{auth.currentUser?.email}</p>
          <p className={`text-sm font-semibold text-slate-800 mb-3 ${open ? "block" : "hidden"}`}>
            Upgrade plan
          </p>
          <button className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold py-2 shadow-sm hover:shadow-md transition">
            Day 5 of 7
          </button>
        </div>
      </div>
    </aside>
  );
}
