/* // src/components/RoleRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoutes = ({ children, allowedRoles = [] }) => {
  const [user, loadingAuth] = useAuthState(auth); // waits for firebase auth
  const [checkingRole, setCheckingRole] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchRole = async () => {
      // if still checking auth or no user, stop after setting state
      if (!user) {
        if (mounted) {
          setRole(null);
          setCheckingRole(false);
        }
        return;
      }

      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!mounted) return;

        if (snap.exists()) {
          setRole(snap.data().role || null);
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("Error fetching role:", err);
        setRole(null);
      } finally {
        if (mounted) setCheckingRole(false);
      }
    };

    setCheckingRole(true);
    fetchRole();

    return () => {
      mounted = false;
    };
  }, [user]);

  // 1) still checking firebase auth?
  if (loadingAuth || checkingRole) {
    return <div>Loading...</div>; // replace with spinner component if you want
  }

  // 2) not logged in -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3) user logged in but role not allowed -> redirect to not-authorized
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  // 4) allowed
  return children;
};

export default ProtectedRoutes;
 */

import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import SidebarDark from "./SidebarDark";

const ProtectedRoutes = ({ user: propUser, allowedRoles = [] }) => {
  const [user, loadingAuth] = useAuthState(auth);
  const [checkingRole, setCheckingRole] = useState(true);
  const [role, setRole] = useState(null);

  const currentUser = propUser || user;

  useEffect(() => {
    let mounted = true;

    const fetchRole = async () => {
      if (loadingAuth) return;

      if (!currentUser) {
        if (mounted) {
          setRole(null);
          setCheckingRole(false);
        }
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (mounted) {
          setRole(snap.exists() ? snap.data().role : null);
        }
      } catch (error) {
        console.error("Error fetching role:", error);
        if (mounted) {
          setRole(null);
        }
      } finally {
        if (mounted) setCheckingRole(false);
      }
    };

    setCheckingRole(true);
    fetchRole();

    return () => (mounted = false);
  }, [currentUser, loadingAuth]);

  // Loading state
  if (loadingAuth || checkingRole) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Has role restriction and role doesn't match
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  // Render protected routes with sidebar
  return (
    <div className="flex">
      <SidebarDark />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedRoutes;
