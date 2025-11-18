import { useState } from "react";
import { FiHome, FiAlertOctagon, FiSettings } from "react-icons/fi";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  const menu = [
    { name: "Dashboard", icon: <FiHome size={20} /> },
    { name: "My Bugs", icon: <FiAlertOctagon size={20} /> },
    { name: "Settings", icon: <FiSettings size={20} /> },
  ];

  return (
    <div className="relative">
      {/* Toggle Button OUTSIDE the resizing sidebar */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-6 z-50 bg-indigo-600 text-white p-1 rounded-full shadow-md hover:bg-indigo-700 transition"
      >
        {open ? <IoIosArrowBack size={18} /> : <IoIosArrowForward size={18} />}
      </button>

      {/* Sidebar */}
      <div
        className={`h-screen bg-white border-r shadow-lg flex flex-col transition-all duration-300 
        ${open ? "w-60" : "w-20"} overflow-visible`}
      >
        {/* App Title */}
        <div className="flex items-center gap-2 mt-6 mb-10 px-4">
          <FiAlertOctagon className="text-indigo-600" size={28} />
          <h1
            className={`text-2xl font-bold text-indigo-600 whitespace-nowrap transition-opacity duration-300
            ${open ? "opacity-100" : "opacity-0"}`}
          >
            Bug Report
          </h1>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-3 px-3">
          {menu.map((item, i) => (
            <button
              key={i}
              className="relative flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 group transition cursor-pointer"
            >
              <span className="text-indigo-600">{item.icon}</span>

              <span
                className={`text-gray-700 font-medium whitespace-nowrap transition-all duration-300
                ${open ? "opacity-100" : "opacity-0"} group-hover:text-indigo-600`}
              >
                {item.name}
              </span>

              {/* Tooltip when collapsed */}
              {!open && (
                <span className="absolute left-16 bg-gray-800 text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  {item.name}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto px-3 pb-5">
          <p
            className={`text-sm text-gray-500 transition-all duration-300 whitespace-nowrap
            ${open ? "opacity-100" : "opacity-0"}`}
          >
            © 2025 Bug Report
          </p>
        </div>
      </div>
    </div>
  );
}
