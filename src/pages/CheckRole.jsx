import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const CheckRole = () => {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        } else {
          setRole("no role found");
        }
      } else {
        setRole("not logged in");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-xl font-semibold text-gray-600">Checking role...</h2>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {role === "admin" ? (
        <h1 className="text-3xl font-bold text-green-600">✅ Admin Logged In</h1>
      ) : role === "user" ? (
        <h1 className="text-3xl font-bold text-blue-600">👤 User Logged In</h1>
      ) : role === "not logged in" ? (
        <h1 className="text-3xl font-bold text-red-500">⚠️ Please log in first</h1>
      ) : (
        <h1 className="text-3xl font-bold text-gray-500">No role assigned</h1>
      )}
    </div>
  );
};

export default CheckRole;
