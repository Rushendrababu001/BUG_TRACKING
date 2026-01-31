import React, { useEffect, useMemo, useState } from "react";
import { db, auth } from "../../firebaseConfig";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  getDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FiMoreVertical } from "react-icons/fi";
import ViewBugModal from "../../Components/ViewBugModal";
import EditBugDrawer from "./EditBugDrawer";
import AssignModal from "../../Components/AssignModal";
import { getProjectById } from "../../services/projectService";

export default function BugsTable({
  appliedFilters,
  searchQuery = "",
  viewMode = "table",
}) {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("user");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingBug, setEditingBug] = useState(null);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewBug, setViewBug] = useState(null);
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [assignBug, setAssignBug] = useState(null);
  const [projectNames, setProjectNames] = useState({});

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredBugs = useMemo(() => {
    if (!searchQuery) return bugs;
    const q = searchQuery.trim().toLowerCase();
    return bugs.filter((bug) => {
      const titleMatch = bug.title?.toLowerCase().includes(q);
      const idMatch = bug.bugId?.toString().toLowerCase().includes(q);
      const ownerMatch = bug.createdByName?.toLowerCase().includes(q);
      return titleMatch || idMatch || ownerMatch;
    });
  }, [bugs, searchQuery]);

  const sortedBugs = useMemo(() => {
    const source = [...filteredBugs];
    return source.sort((a, b) => {
      if (!sortField) return 0;
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "createdAt") {
        valA = valA?.toDate ? valA.toDate() : valA;
        valB = valB?.toDate ? valB.toDate() : valB;
      } else if (typeof valA === "string") {
        valA = valA?.toLowerCase?.() ?? valA;
        valB = valB?.toLowerCase?.() ?? valB;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredBugs, sortField, sortOrder]);

  const handleView = (bug) => {
    setViewBug(bug);
    setOpenViewModal(true);
    setMenuOpen(null);
  };

  const handleEdit = (bug) => {
    setEditingBug(bug);
    setOpenEditDrawer(true);
    setMenuOpen(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this bug?")) return;
    await deleteDoc(doc(db, "bugs", id));
    setMenuOpen(null);
  };

  // Firestore subscription with filters
  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setBugs([]);
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userRole = userSnap.exists() ? userSnap.data().role : "user";
      setRole(userRole);

      const bugsRef = collection(db, "bugs");

      if (userRole === "admin") {
        const conditions = [];

        if (appliedFilters.username && appliedFilters.username.trim() !== "") {
          conditions.push(where("createdByName", "==", appliedFilters.username.trim()));
        }
        if (appliedFilters.bugId && appliedFilters.bugId.trim() !== "") {
          conditions.push(where("bugId", "==", appliedFilters.bugId.trim()));
        }
        if (appliedFilters.severity && appliedFilters.severity.trim() !== "") {
          conditions.push(where("severity", "==", appliedFilters.severity));
        }
        if (appliedFilters.status && appliedFilters.status.trim() !== "") {
          conditions.push(where("status", "==", appliedFilters.status));
        }
        if (appliedFilters.from) {
          const d = new Date(appliedFilters.from);
          d.setHours(0, 0, 0, 0);
          conditions.push(where("createdAt", ">=", Timestamp.fromDate(d)));
        }
        if (appliedFilters.to) {
          const d = new Date(appliedFilters.to);
          d.setHours(23, 59, 59, 999);
          conditions.push(where("createdAt", "<=", Timestamp.fromDate(d)));
        }

        // Build query: conditions may be empty
        const q = query(bugsRef, ...conditions, orderBy("createdAt", "desc"));
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        unsubscribeSnapshot = onSnapshot(q, (snap) => {
          setBugs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
      } else {
        // non-admin: show only user's bugs
        const q = query(bugsRef, where("createdBy", "==", user.uid), orderBy("createdAt", "desc"));
        if (unsubscribeSnapshot) unsubscribeSnapshot();
        unsubscribeSnapshot = onSnapshot(q, (snap) => {
          setBugs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        });
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, [appliedFilters]);

  // Fetch project names for bugs that have projectId
  useEffect(() => {
    const fetchProjectNames = async () => {
      const newProjectNames = { ...projectNames };
      
      for (const bug of bugs) {
        if (bug.projectId && !projectNames[bug.projectId]) {
          try {
            const project = await getProjectById(bug.projectId);
            if (project) {
              newProjectNames[bug.projectId] = project.name;
            }
          } catch (error) {
            console.error('Error fetching project:', error);
          }
        }
      }
      
      setProjectNames(newProjectNames);
    };

    if (bugs.length > 0) {
      fetchProjectNames();
    }
  }, [bugs]);

  // modern color maps
  const severityStyles = {
    Low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
    High: "bg-rose-50 text-rose-700 ring-rose-600/20",
    Critical: "bg-red-100 text-red-800 ring-red-600/30 font-bold",
  };

  const statusStyles = {
    Open: "bg-purple-50 text-purple-700 ring-purple-700/10",
    "In Progress": "bg-blue-50 text-blue-700 ring-blue-700/10",
    In_Progress: "bg-blue-50 text-blue-700 ring-blue-700/10",
    Resolved: "bg-teal-50 text-teal-700 ring-teal-600/20",
    Closed: "bg-slate-50 text-slate-600 ring-slate-500/10",
  };

  const SortIcon = ({ field }) => {
    const isActive = sortField === field;
    return (
      <span className={`ml-2 flex flex-col space-y-0.5 transition-all ${isActive ? "opacity-100" : "opacity-30 group-hover:opacity-50"}`}>
        <svg className={`w-2.5 h-2.5 ${isActive && sortOrder === "asc" ? "text-indigo-600" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h16l-8-8z"/></svg>
        <svg className={`w-2.5 h-2.5 ${isActive && sortOrder === "desc" ? "text-indigo-600" : "text-gray-400"}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8H4l8 8z"/></svg>
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-indigo-500 animate-pulse">
        <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        Loading bugs...
      </div>
    );

  if (!bugs.length)
    return (
      <div className="p-12 text-center text-sm">
        <div className="text-3xl mb-2">📭</div>
        <p className="text-slate-600 font-medium">No bugs found yet.</p>
        <p className="text-xs text-slate-400">Create a bug to kick off your first task.</p>
      </div>
    );

  const tableView = (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500 border-b border-slate-100">
            <th
              onClick={() => handleSort("bugId")}
              className="py-3 px-4 font-semibold cursor-pointer group select-none hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center">
                Bug ID <SortIcon field="bugId" />
              </div>
            </th>
            {role === "admin" && <th className="py-3 px-4 font-semibold">User</th>}
            <th className="py-3 px-4 font-semibold">Title</th>
            <th className="py-3 px-3 font-semibold">Screenshot</th>
            <th className="py-3 px-3 font-semibold">Project</th>
            <th
              onClick={() => handleSort("severity")}
              className="py-3 px-3 font-semibold cursor-pointer group select-none hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center">
                Severity <SortIcon field="severity" />
              </div>
            </th>
            <th
              onClick={() => handleSort("status")}
              className="py-3 px-3 font-semibold cursor-pointer group select-none hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center">
                Status <SortIcon field="status" />
              </div>
            </th>
            <th
              onClick={() => handleSort("createdAt")}
              className="py-3 px-3 font-semibold cursor-pointer group select-none hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center">
                Created <SortIcon field="createdAt" />
              </div>
            </th>
            <th className="py-3 px-3" />
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 text-[13px]">
          {sortedBugs.map((b) => (
            <tr key={b.id} className="group hover:bg-indigo-50/30 transition-colors duration-200">
              <td className="py-3 px-4">
                <span className="font-semibold text-indigo-600 text-sm">{b.bugId || "—"}</span>
              </td>

              {role === "admin" && (
                <td className="py-3 px-4">
                  <span className="font-medium text-slate-700">{b.createdByName || "Unknown"}</span>
                </td>
              )}

              <td className="py-3 px-4 max-w-xs">
                <div className="font-semibold text-slate-800 truncate">{b.title}</div>
                <div className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{b.description}</div>
              </td>

              <td className="py-3 px-3">
                {b.screenshotURL ? (
                  <a
                    href={b.screenshotURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-14 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
                  >
                    <img src={b.screenshotURL} alt="bug" className="w-full h-full object-cover" />
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No image</span>
                )}
              </td>

              <td className="py-3 px-3">
                {b.projectId && projectNames[b.projectId] ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                    {projectNames[b.projectId]}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No project</span>
                )}
              </td>

              <td className="py-3 px-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${
                    severityStyles[b.severity] || "bg-slate-50 text-slate-600 ring-slate-500/10"
                  }`}
                >
                  {b.severity}
                </span>
              </td>

              <td className="py-3 px-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${
                    statusStyles[b.status] || "bg-slate-50 text-slate-600 ring-slate-500/10"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      b.status === "Open"
                        ? "bg-purple-500"
                        : b.status === "In Progress" || b.status === "In_Progress"
                        ? "bg-blue-500"
                        : "bg-green-500"
                    }`}
                  />
                  {b.status}
                </span>
              </td>

              <td className="py-3 px-3 text-slate-500">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-700">
                    {b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString() : ""}
                  </span>
                  <span className="text-xs text-slate-400">
                    {b.createdAt?.toDate
                      ? b.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </span>
                </div>
              </td>

              <td className="py-3 px-3 text-right relative">
                <div
                  className="inline-block font-bold text-slate-600 hover:text-indigo-600 cursor-pointer"
                  onClick={() => setMenuOpen(menuOpen === b.id ? null : b.id)}
                >
                  <FiMoreVertical size={18} />
                </div>

                {menuOpen === b.id && (
                  <div className="absolute right-4 mt-2 w-32 bg-white shadow-xl rounded-xl border border-slate-100 z-50 text-xs">
                    {role === "admin" && (
                      <button
                        onClick={() => {
                          setAssignBug(b);
                          setOpenAssignModal(true);
                          setMenuOpen(null);
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-slate-50"
                      >
                        Assign
                      </button>
                    )}
                    <button onClick={() => handleView(b)} className="block w-full text-left px-4 py-2 hover:bg-slate-50">
                      View
                    </button>
                    <button onClick={() => handleEdit(b)} className="block w-full text-left px-4 py-2 hover:bg-slate-50">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="block w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const gridView = (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 p-4">
      {sortedBugs.map((b) => (
        <article key={b.id} className="rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 uppercase">#{b.bugId || "—"}</p>
              <h4 className="font-semibold text-slate-900 leading-snug">{b.title}</h4>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${
                severityStyles[b.severity] || "bg-slate-50 text-slate-600 ring-slate-500/10"
              }`}
            >
              {b.severity}
            </span>
          </div>
          <p className="text-xs text-slate-500 line-clamp-3">{b.description}</p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{b.createdByName || "Unknown"}</span>
            <span>{b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString() : ""}</span>
          </div>
          {b.projectId && projectNames[b.projectId] && (
            <div className="text-xs">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md font-medium bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20">
                {projectNames[b.projectId]}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ring-inset ${
                statusStyles[b.status] || "bg-slate-50 text-slate-600 ring-slate-500/10"
              }`}
            >
              {b.status}
            </span>
            <div className="flex items-center gap-2 text-[12px] font-medium text-indigo-600">
              <button onClick={() => handleView(b)}>View</button>
              <span className="text-slate-300">•</span>
              <button onClick={() => handleEdit(b)}>Edit</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <>
      {viewMode === "grid" ? gridView : tableView}

      {openViewModal && viewBug && <ViewBugModal bug={viewBug} onClose={() => setOpenViewModal(false)} />}

      {openEditDrawer && editingBug && (
        <EditBugDrawer open={openEditDrawer} onClose={() => setOpenEditDrawer(false)} bug={editingBug} />
      )}

      {openAssignModal && assignBug && (
        <AssignModal bug={assignBug} open={openAssignModal} onClose={() => setOpenAssignModal(false)} />
      )}
    </>
  );
}
