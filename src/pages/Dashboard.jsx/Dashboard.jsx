import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

import Sidebar from "./SideBar";
import BugsTable from "./BugsTable";
import CreateBugDrawer from "./CreateBugDrawer";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserData(snap.data());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-y-auto p-8">

        {/* Top Header */}
        <div className="flex justify-between items-center mb-6">

          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-gray-500">Track and manage bug reports</p>
          </div>

          <div className="flex items-center gap-5">

            <button
              onClick={() => setOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow transition-all"
            >
              + Report a Bug
            </button>

            {/* Profile Info */}
            {userData && (
              <div className="flex items-center gap-3 bg-white border px-4 py-2 rounded-full shadow-sm hover:shadow transition cursor-pointer">
                <img
                  src={userData?.photoURL || "https://ui-avatars.com/api/?name=User&background=random"}
                  alt="profile"
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <span className="font-medium text-gray-700">
                  {userData?.username || "User"}
                </span>
              </div>
            )}

            {/* Button */}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <BugsTable />
        </div>
      </div>

      {/* Drawer */}
      <CreateBugDrawer open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
