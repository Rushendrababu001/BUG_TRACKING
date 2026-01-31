import React, { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import Button from "./Button";
import emailjs from "emailjs-com";

export default function AssignModal({ open, onClose, bug }) {
  const [email, setEmail] = useState(bug?.assignedToEmail || "");
  const [sending, setSending] = useState(false);

  if (!open || !bug) return null;

  const sendEmail = async ({ bugId, title, description, assignedToEmail }) => {
    const templateParams = {
      to_email: assignedToEmail,
      bug_id: bugId,
      title,
      description,
      link_resolve: `${window.location.origin}/bug-action/resolve?bugId=${encodeURIComponent(bugId)}`,
      link_invalid: `${window.location.origin}/bug-action/invalid?bugId=${encodeURIComponent(bugId)}`,
    };
    return emailjs.send("service_ljnalep", "template_nh4ei58", templateParams, "B-rQPagdAac2CgcWk");
  };

  const handleAssign = async () => {
    if (!email) return alert("Enter developer email");

    setSending(true);
    try {
      const user = auth.currentUser;
      const bugRef = doc(db, "bugs", bug.id);
      await updateDoc(bugRef, {
        assignedToEmail: email,
        assignedBy: user.uid,
        assignedByName: user.displayName || "",
        assignedAt: serverTimestamp(),
        status: "In Progress",
      });

      try {
        await sendEmail({
          bugId: bug.bugId,
          title: bug.title,
          description: bug.description,
          assignedToEmail: email,
        });
      } catch (e) {
        console.error("Email send failed (EmailJS)", e);
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert("Assign failed.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 shadow-2xl p-6 space-y-6">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-400">Assign bug</p>
            <h3 className="text-xl font-semibold text-slate-900">#{bug.bugId} · {bug.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2">{bug.description}</p>
          </header>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Developer email
            </label>
            <input
              type="email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-300 focus:bg-white focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dev@example.com"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleAssign} loading={sending} loadingText="Sending...">
              Assign & notify
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
