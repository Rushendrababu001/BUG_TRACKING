import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { X, Filter } from "lucide-react";

export default function FilterModal({ open, onClose, onApply }) {
  const [filters, setFilters] = useState({
    username: "",
    bugId: "",
    severity: "",
    status: "",
    from: "",
    to: "",
  });

  const [usernames, setUsernames] = useState([]);
  const [bugIds, setBugIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const users = usersSnap.docs.map((d) => d.data()?.username).filter(Boolean);
        const bugsSnap = await getDocs(collection(db, "bugs"));
        const ids = bugsSnap.docs.map((d) => d.data()?.bugId).filter(Boolean);

        if (!mounted) return;
        setUsernames(Array.from(new Set(users)));
        setBugIds(Array.from(new Set(ids)));
      } catch (err) {
        console.error("Failed to load filter dropdown data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const apply = () => {
    onApply(filters);
    onClose();
  };

  const reset = () => {
    const empty = { username: "", bugId: "", severity: "", status: "", from: "", to: "" };
    setFilters(empty);
    onApply(empty);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-lg p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-gray-900">Filter Bugs</h3>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
              <Filter size={14} /> Advanced
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X size={20} className="text-gray-400 hover:text-gray-700" />
          </button>
        </div>

        {/* Filter Fields */}
        <div className="space-y-4 pb-4 border-b border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Filter By:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <select
                name="username"
                value={filters.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-700"
              >
                <option value="">All users</option>
                {loading ? (
                  <option>Loading...</option>
                ) : (
                  usernames.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Bug ID dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bug ID</label>
              <select
                name="bugId"
                value={filters.bugId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-700"
              >
                <option value="">All bug IDs</option>
                {loading ? (
                  <option>Loading...</option>
                ) : (
                  bugIds.map((id) => (
                    <option key={id} value={id}>
                      {id}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select 
                name="severity" 
                value={filters.severity} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-700"
              >
                <option value="">Any severity</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                name="status" 
                value={filters.status} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-700"
              >
                <option value="">Any status</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
                <option value="Invalid">Invalid</option>
              </select>
            </div>

            {/* From date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input 
                name="from" 
                type="date" 
                value={filters.from} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-700"
              />
            </div>

            {/* To date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input 
                name="to" 
                type="date" 
                value={filters.to} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={reset} 
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all duration-200"
          >
            Reset
          </button>
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={apply} 
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
          >
            <Filter size={16} /> Apply
          </button>
        </div>
      </div>
    </div>
  );
}
