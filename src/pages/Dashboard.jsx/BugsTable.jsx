import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebaseConfig";
import { collection, onSnapshot, query, orderBy, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function BugsTable() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("user");

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setBugs([]);
        setLoading(false);
        return;
      }

      // 👉 STEP 1: Fetch user role from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const role = userSnap.exists() ? userSnap.data().role : "user";
      setRole(role);

      // 👉 STEP 2: Build query based on role
      const bugsRef = collection(db, "bugs");
      const q =
        role === "admin"
          ? query(bugsRef, orderBy("createdAt", "desc")) // Admin: ALL bugs
          : query(
              bugsRef,
              where("createdBy", "==", user.uid),           // User: Own bugs only
              orderBy("createdAt", "desc")
            );

      // 👉 STEP 3: Subscribe to data
      unsubscribeSnapshot = onSnapshot(q, (snap) => {
        setBugs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  if (loading) return <p className="p-4 text-gray-500">Loading bugs...</p>;
  if (!bugs.length) return <p className="p-4 text-gray-500">No bugs found.</p>;

  const severityColor = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  const statusColor = {
    Open: "bg-gray-100 text-gray-700",
    Closed: "bg-blue-100 text-blue-700",
    "In Progress": "bg-orange-100 text-orange-700",
    Resolved: "bg-green-100 text-green-700",
  };

  return (
    <table className="w-full">
      <thead>
        <tr className="text-left text-gray-600 border-b">
          {role === "admin" && <th className="pb-3">Username</th>}
          <th className="pb-3">Title</th>
          <th className="pb-3">Description</th>
          <th className="pb-3">Screenshot</th>
          <th className="pb-3">Severity</th>
          <th className="pb-3">Status</th>
          <th className="pb-3">Created At</th>
        </tr>
      </thead>

      <tbody>
        {bugs.map((b) => (
          <tr key={b.id} className="border-b hover:bg-gray-50 transition cursor-pointer">
            {role === "admin" && (<td className="py-3 font-medium">{b.createdByName || "—"} </td>)}
            <td className="py-3 font-medium">{b.title}</td>
            <td className="py-3 font-medium">{b.description}</td>

            {/* Screenshot */}
            <td className="py-3">
              {b.screenshotURL ? (
                <a href={b.screenshotURL} target="_blank" rel="noopener noreferrer">
                  <img
                    src={b.screenshotURL}
                    alt="bug screenshot"
                    className="w-14 h-10 object-cover rounded border hover:opacity-80"
                  />
                </a>
              ) : (
                <span className="text-gray-400 text-sm">—</span>
              )}
            </td>

            <td>
              <span className={`px-3 py-1 text-sm rounded-full ${severityColor[b.severity]}`}>
                {b.severity}
              </span>
            </td>

            <td>
              <span className={`px-3 py-1 text-sm rounded-full ${statusColor[b.status]}`}>
                {b.status}
              </span>
            </td>

            <td className="text-gray-500">
              {b.createdAt?.toDate().toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
