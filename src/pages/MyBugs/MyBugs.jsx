import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import BugsTable from "./BugsTable";
import CreateBugDrawer from "./CreateBugDrawer";
import Button from "../../Components/Button";
import FilterModal from "../../Components/FilterModal";
import FilterButton from "../../Components/FilterButton";
import { useBugContext } from "../../contexts";
import { KanbanBoard } from "../../Components/Advanced";
import { User } from "lucide-react";
import { FiSearch, FiDownloadCloud, FiGrid, FiList } from "react-icons/fi";
import { useUIContext } from "../../contexts/UIContext";
import { updateBug } from "../../services/bugService";

const statTemplates = [
  { key: "total", label: "Total bugs", accent: "text-slate-900", bg: "bg-slate-100" },
  { key: "open", label: "Waiting attention", accent: "text-amber-600", bg: "bg-amber-50" },
  { key: "inprogress", label: "In progress", accent: "text-indigo-600", bg: "bg-indigo-50" },
  { key: "resolved", label: "Resolved", accent: "text-emerald-600", bg: "bg-emerald-50" },
  ];

export default function MyBugs() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [userData, setUserData] = useState(null);
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const { searchQuery } = useUIContext();
  const [updating, setUpdating] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    username: "",
    bugId: "",
    severity: "",
    status: "",
    from: "",
    to: "",
  });
  const [viewMode, setViewMode] = useState("table");
  const { filteredBugs, stats } = useBugContext();

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData({ uid: user.uid, ...snap.data() });
      }
    });
  }, []);

  const filterChips = useMemo(() => {
    const chips = [];
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (!value) return;
      const labelMap = {
        username: "Owner",
        bugId: "Bug ID",
        severity: "Severity",
        status: "Status",
        from: "From",
        to: "To",
      };
      chips.push({ key, label: `${labelMap[key] || key}: ${value}` });
    });
    return chips;
  }, [appliedFilters]);

  const handleKanbanDrop = async (bugId, newStatus) => {
    try {
      setUpdating(true);
      await updateBug(bugId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update bug status:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-900">
      <main className="h-screen overflow-y-auto px-6 py-8 lg:px-10 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Tracker workspace</p>
            <h1 className="text-2xl font-semibold text-slate-900">My Bugs</h1>
            <p className="text-sm text-slate-500">
              Manage bugs and collaborate with your team.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-1.5 shadow-sm border border-slate-100">
              <FiSearch className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus:ring-0 text-sm placeholder:text-slate-400 w-40 bg-transparent"
                placeholder="Search bug title..."
              />
            </div>
            {userData?.role === "admin" && (
              <FilterButton onClick={() => setFilterOpen(true)} />
            )}
            <Button onClick={() => setOpenDrawer(true)}>+ Create Bug</Button>
            {userData && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {userData.profilePic ? (
                      <img src={userData.profilePic} alt={userData.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <span
                    className={`absolute -bottom-1 -right-1 px-1 py-0.5 rounded-full text-[10px] font-semibold text-white ${
                      userData.role === "admin" ? "bg-rose-500" : "bg-indigo-500"
                    }`}
                  >
                    {userData.role}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{userData.username}</p>
                  <p className="text-xs text-slate-400">{userData.email}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {statTemplates.map((stat) => (
            <div key={stat.key} className={`${stat.bg} border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition`}>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.accent}`}>{stats[stat.key] ?? 0}</p>
              {stat.key === "open" && stats.critical > 0 && (
                <p className="text-[11px] text-rose-600 mt-1">
                  {stats.critical} critical issues
                </p>
              )}
            </div>
          ))}
        </section>

        {filterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-100 rounded-2xl px-3 py-2 shadow-sm text-xs">
            <span className="font-semibold uppercase tracking-wide text-slate-400">Active Filters</span>
            {filterChips.map((chip) => (
              <span key={chip.key} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                {chip.label}
              </span>
            ))}
            <button
              className="ml-auto text-indigo-600 font-semibold hover:text-indigo-700"
              onClick={() =>
                setAppliedFilters({
                  username: "",
                  bugId: "",
                  severity: "",
                  status: "",
                  from: "",
                  to: "",
                })
              }
            >
              Clear All
            </button>
          </div>
        )}

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 text-sm">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Bug list</h3>
              <p className="text-xs text-slate-500">Real-time updates of all bugs.</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 rounded-2xl border border-slate-200 p-1 bg-slate-50">
                {[
                  { id: "table", label: "Table", icon: <FiList className="h-4 w-4" /> },
                  { id: "kanban", label: "Kanban", icon: <FiGrid className="h-4 w-4" /> },
                ].map((option) => (
                  <Button
                    key={option.id}
                    variant={viewMode === option.id ? "primary" : "ghost"}
                    size="sm"
                    className="px-2"
                    leftIcon={option.icon}
                    onClick={() => setViewMode(option.id)}
                    aria-pressed={viewMode === option.id}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {viewMode === "table" ? (
            <BugsTable
              appliedFilters={appliedFilters}
              searchQuery={search}
            />
          ) : (
            <KanbanBoard 
              bugs={filteredBugs} 
              onDragEnd={handleKanbanDrop}
            />
          )}
        </section>
      </main>

      <CreateBugDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />

      {userData?.role === "admin" && (
        <FilterModal
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          onApply={(data) => setAppliedFilters(data)}
        />
      )}
    </div>
  );
}
