import { useState, useEffect, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import Button from "./Button";
import { getCommentsByBug, getActivityLogs } from "../services/commentService";

const severityStyles = {
  Low: "bg-emerald-50 text-emerald-600",
  Medium: "bg-amber-50 text-amber-600",
  High: "bg-rose-50 text-rose-600",
  Critical: "bg-red-100 text-red-700",
};

const statusStyles = {
  Open: "bg-purple-50 text-purple-600",
  "In Progress": "bg-blue-50 text-blue-600",
  In_Progress: "bg-blue-50 text-blue-600",
  Resolved: "bg-emerald-50 text-emerald-600",
  Closed: "bg-slate-100 text-slate-600",
};

export default function ViewBugModal({ bug, onClose }) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole(null);
        return;
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      setRole(userDoc.exists() ? userDoc.data().role : null);
    });

    return () => unsubscribe();
  }, []);

  const createdAt = useMemo(() => {
    if (!bug?.createdAt?.toDate) return "—";
    return bug.createdAt.toDate().toLocaleString();
  }, [bug]);

  const [activity, setActivity] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!bug?.id) return;
      try {
        const acts = await getActivityLogs(bug.id);
        const comms = await getCommentsByBug(bug.id);
        if (!mounted) return;
        setActivity(acts || []);
        setComments(comms || []);
      } catch (e) {
        console.error('Failed to load activity/comments', e);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [bug]);

  if (!bug) return null;

  const overlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={overlayClick}
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
    >
      <article className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 lg:p-8 space-y-6">
        <button
          onClick={onClose}
          aria-label="Close bug details"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
        >
          ✕
        </button>

        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Bug ID #{bug.bugId || "—"}</p>
          <h2 className="text-2xl font-semibold text-slate-900">{bug.title}</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={`px-3 py-1 rounded-full font-semibold ${severityStyles[bug.severity] || "bg-slate-100 text-slate-600"}`}
            >
              {bug.severity}
            </span>
            <span
              className={`px-3 py-1 rounded-full font-semibold ${statusStyles[bug.status] || "bg-slate-100 text-slate-600"}`}
            >
              {bug.status}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">
              {createdAt}
            </span>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {role === "admin" && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-xs uppercase text-slate-400">Created by</p>
              <p className="text-slate-700 font-medium">{bug.createdByName || "Unknown"}</p>
            </div>
          )}
          {bug.assignedToEmail && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-xs uppercase text-slate-400">Assigned to</p>
              <p className="text-slate-700 font-medium">{bug.assignedToEmail}</p>
            </div>
          )}
        </section>

        <section className="space-y-2 text-sm text-slate-600">
          <p className="text-xs uppercase tracking-wide text-slate-400">Description</p>
          <p className="leading-relaxed">{bug.description}</p>
        </section>

        {bug.screenshotURL && (
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Screenshot</p>
            <a href={bug.screenshotURL} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={bug.screenshotURL}
                alt="Bug Screenshot"
                className="rounded-2xl border border-slate-100 shadow-sm max-h-72 w-full object-cover"
              />
            </a>
          </section>
        )}

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>

        {activity.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-100 p-4 mt-4">
            <h4 className="text-sm font-semibold mb-2">Activity</h4>
            <ul className="text-sm text-slate-600 space-y-2">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <div className="text-xs text-slate-400">{new Date(a.timestamp?.toDate ? a.timestamp.toDate() : a.timestamp || Date.now()).toLocaleString()}</div>
                  <div className="flex-1">{a.message}</div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {comments.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-100 p-4 mt-4">
            <h4 className="text-sm font-semibold mb-2">Comments</h4>
            <ul className="text-sm text-slate-600 space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="">
                  <div className="text-xs text-slate-400">{c.authorName || c.author || 'User'} · {new Date(c.createdAt?.toDate ? c.createdAt.toDate() : c.createdAt || Date.now()).toLocaleString()}</div>
                  <div className="mt-1">{c.text || c.comment}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
