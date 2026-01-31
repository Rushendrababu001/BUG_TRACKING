import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useBugContext } from "../../contexts";
import { KanbanBoard, PriorityMatrix, GanttChart } from "../../Components/Advanced";
import { formatDate } from "../../utils";
import SummaryCards from "../../Components/SummaryCards";
import TopHeader from "../../Components/TopHeader";
import MyWorkPanel from "../../Components/MyWorkPanel";
import { useUIContext } from "../../contexts/UIContext";
import { updateBug } from "../../services/bugService";

const Dashboard = () => {
  const { bugs: allBugs, stats } = useBugContext();
  const { searchQuery } = useUIContext();
  const [totalUsers, setTotalUsers] = useState(0);
  const [userBreakdown, setUserBreakdown] = useState({ admin: 0, user: 0 });
  const [role, setRole] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [recentBugs, setRecentBugs] = useState([]);
  const [viewMode, setViewMode] = useState("overview");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setAuthUser(firebaseUser);
        fetchUserRole(firebaseUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserRole = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data();
      setRole(data.role);
      if (data.role === "admin") {
        fetchAdminBugStats();
        fetchTotalUsers();
      }
    }
  };

  const fetchAdminBugStats = async () => {
    const bugsSnap = await getDocs(collection(db, "bugs"));
    const recents = [];
    bugsSnap.forEach((bugDoc) => {
      const b = bugDoc.data();
      if (b.createdAt?.toDate) {
        recents.push({
          id: bugDoc.id,
          bugId: b.bugId,
          title: b.title,
          severity: b.severity,
          status: b.status,
          owner: b.createdByName || "Unknown",
          createdAt: b.createdAt.toDate(),
        });
      }
    });
    recents.sort((a, b) => b.createdAt - a.createdAt);
    setRecentBugs(recents.slice(0, 6));
  };

  const fetchTotalUsers = async () => {
    const snap = await getDocs(collection(db, "users"));
    let admins = 0,
      members = 0;
    snap.forEach((docSnap) => {
      docSnap.data().role === "admin" ? (admins += 1) : (members += 1);
    });
    setTotalUsers(snap.size);
    setUserBreakdown({ admin: admins, user: members });
  };

  const completionRate =
    stats.total > 0 ? Math.round(((stats.resolved || 0) / stats.total) * 100) : 0;

  // Apply search filter to bugs
  const filteredAllBugs = React.useMemo(() => {
    if (!searchQuery || !allBugs) return allBugs;
    const q = searchQuery.toLowerCase();
    return allBugs.filter((b) => {
      return (
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.bugId && b.bugId.toLowerCase().includes(q)) ||
        (b.createdByName && b.createdByName.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, allBugs]);

  const filteredRecentBugs = React.useMemo(() => {
    if (!searchQuery || !recentBugs) return recentBugs;
    const q = searchQuery.toLowerCase();
    return recentBugs.filter((b) => (b.title || '').toLowerCase().includes(q) || (b.owner || '').toLowerCase().includes(q));
  }, [searchQuery, recentBugs]);

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-700',
      'High': 'bg-orange-100 text-orange-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-blue-100 text-blue-700'
    };
    return colors[severity] || 'bg-slate-100 text-slate-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-amber-100 text-amber-700',
      'In Progress': 'bg-indigo-100 text-indigo-700',
      'Resolved': 'bg-emerald-100 text-emerald-700',
      'Closed': 'bg-slate-100 text-slate-700',
      'Invalid': 'bg-purple-100 text-purple-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

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
      <main className="px-8 py-8 lg:px-12 overflow-y-auto">
        {!role ? (
          <div className="text-center py-20">Loading dashboard...</div>
        ) : (
          <div className="space-y-6">
            <TopHeader />

            <div className="mt-4">
              <SummaryCards />
            </div>

            <div className="flex gap-3 flex-wrap">
              {["overview", "kanban", "priority", "timeline"].map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === m ? "bg-indigo-600 text-white" : "bg-white border border-slate-200"
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            {viewMode === "overview" && (
              <div className="space-y-6">
                <MyWorkPanel recentBugs={filteredRecentBugs} />

                <section className="bg-white rounded-3xl border border-slate-100 p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredRecentBugs && filteredRecentBugs.length > 0 ? (
                      filteredRecentBugs.map((bug) => (
                        <div key={bug.id} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold">{(bug.title || 'B').charAt(0)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-slate-900">{bug.title}</h4>
                              <span className="text-xs text-slate-500">{formatDate(bug.createdAt)}</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{bug.owner ? `Owner: ${bug.owner}` : ''}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(bug.severity)}`}>{bug.severity || 'N/A'}</span>
                              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(bug.status)}`}>{bug.status}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-8 text-center text-slate-600">No recent activity</div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {viewMode === "kanban" && <KanbanBoard bugs={filteredAllBugs} onDragEnd={handleKanbanDrop} />}
            {viewMode === "priority" && <PriorityMatrix bugs={filteredAllBugs} />}
            {viewMode === "timeline" && <GanttChart bugs={filteredAllBugs} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
