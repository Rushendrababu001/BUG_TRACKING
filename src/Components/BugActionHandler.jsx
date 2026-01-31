import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebaseConfig";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function BugActionHandler() {
  const q = useQuery();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Processing...");
  const [loading, setLoading] = useState(true);

  // Detect which action (resolve OR invalid)
  const path = window.location.pathname;

  let action = "";
  if (path.includes("resolve")) action = "Resolved";
  if (path.includes("invalid")) action = "Invalid";

  const bugId = q.get("bugId"); // From URL query (?bugId=BUG-00012)

  useEffect(() => {
    if (!bugId) {
      setMessage("Invalid link — bugId missing.");
      setLoading(false);
      return;
    }

    const updateBugStatus = async () => {
      try {
        // Find bug by bugId (custom ID)
        const bugsRef = collection(db, "bugs");
        const qSnap = query(bugsRef, where("bugId", "==", bugId));
        const snap = await getDocs(qSnap);

        if (snap.empty) {
          setMessage("No bug found with this bugId.");
          setLoading(false);
          return;
        }

        const bugDoc = snap.docs[0].ref;

        // Update status in Firestore
        await updateDoc(bugDoc, {
          status: action,
          statusUpdatedAt: serverTimestamp()
        });

        setMessage(`Bug ${bugId} has been marked as "${action}".`);
      } catch (err) {
        console.error(err);
        setMessage("An error occurred while updating the bug.");
      } finally {
        setLoading(false);

        // Auto redirect after 3 seconds
        /* setTimeout(() => {
          navigate("/", { replace: true });
        }, 3000); */
      }
    };

    updateBugStatus();
  }, [bugId, action, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-2">
          {loading ? "Updating Bug..." : message}
        </h2>
      </div>
    </div>
  );
}
