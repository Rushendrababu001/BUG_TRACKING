import React, { useEffect, useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { FiEdit3, FiLogOut } from "react-icons/fi";
import Button from "../../Components/Button";

const Settings = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      setFirebaseUser(user);
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setNewUsername(data.username || "");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!newUsername.trim()) return;
    try {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        username: newUsername.trim(),
      });
      setUserData((prev) => ({ ...prev, username: newUsername.trim() }));
      setEditMode(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const logout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const metaCards = firebaseUser
    ? [
        {
          label: "Email address",
          value: firebaseUser.email,
        },
        {
          label: "Role",
          value: userData?.role,
          badge:
            userData?.role === "admin"
              ? "bg-purple-50 text-purple-600"
              : "bg-blue-50 text-blue-600",
        },
        {
          label: "Account created",
          value: new Date(firebaseUser.metadata.creationTime).toLocaleString(),
        },
        {
          label: "Last login",
          value: new Date(firebaseUser.metadata.lastSignInTime).toLocaleString(),
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-900">
      <main className="h-screen overflow-y-auto px-8 py-10 lg:px-12">
        {!userData ? (
          <div className="flex justify-center items-center h-64 text-indigo-500 animate-pulse gap-2">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Loading settings...
          </div>
        ) : (
          <div className="space-y-8 max-w-4xl">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Account</p>
                <h1 className="text-3xl font-semibold">Settings</h1>
                <p className="text-slate-500">
                  Manage your workspace identity and session preferences.
                </p>
              </div>
            </header>

            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Display name</p>
                  {editMode ? (
                    <input
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus:border-indigo-300 focus:bg-white focus:outline-none"
                    />
                  ) : (
                    <p className="text-xl font-semibold text-slate-900">{userData.username}</p>
                  )}
                </div>
                {editMode ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<FiEdit3 />}
                    onClick={() => setEditMode(true)}
                  >
                    Edit name
                  </Button>
                )}
              </div>
              <p className="text-sm text-slate-500">
                Use your real name so teammates can recognize you across dashboards.
              </p>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {metaCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-3xl border border-slate-100 bg-white shadow-sm p-5 space-y-2"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
                  {card.badge ? (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${card.badge}`}>
                      {card.value}
                    </span>
                  ) : (
                    <p className="text-sm font-semibold text-slate-800">{card.value}</p>
                  )}
                </div>
              ))}
            </section>

            <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Session</p>
                <h3 className="text-lg font-semibold text-slate-900">Security</h3>
                <p className="text-sm text-slate-500">
                  Sign out of this workspace to switch accounts.
                </p>
              </div>
              <Button variant="danger" leftIcon={<FiLogOut />} onClick={logout}>
                Logout
              </Button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
