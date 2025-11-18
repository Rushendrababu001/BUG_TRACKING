// src/components/RoleRoute.jsx
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
