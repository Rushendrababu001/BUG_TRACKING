import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Button from "../../Components/Button";

export default function EditBugDrawer({ open, onClose, bug }) {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotURL, setScreenshotURL] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const[role, setRole] = useState("");
  
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
      

  if (!open || !bug) return null;

  // Pre-fill fields from selected bug
  useEffect(() => {
    if (bug) {
      setTitle(bug.title);
      setSeverity(bug.severity);
      setDescription(bug.description);
      setStatus(bug.status || "Open");
      setScreenshotURL(bug.screenshotURL || "");
      setPreview(bug.screenshotURL || "");
    }
  }, [bug]);

  // Cloudinary Upload
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Rushendrababu");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dy3avdacj/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageURL = screenshotURL;

      // If new screenshot selected → upload
      if (screenshot) {
        finalImageURL = await uploadToCloudinary(screenshot);
      }

      const bugRef = doc(db, "bugs", bug.id);

      await updateDoc(bugRef, {
        title,
        severity,
        status,
        description,
        screenshotURL: finalImageURL || "",
      });

      alert("Bug updated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error updating bug!");
    }

    setLoading(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed top-0 right-0 w-full max-w-lg h-full bg-white shadow-2xl z-50 p-6 lg:p-8 overflow-y-auto animate-[slide_0.3s_ease]">
        <style>
          {`@keyframes slide {
              from { transform: translateX(100%); }
              to   { transform: translateX(0); }
            }`}
        </style>

        <header className="space-y-1 pb-6 border-b border-slate-100 mb-6">
          <p className="text-xs uppercase tracking-wide text-slate-400">Update issue</p>
          <h2 className="text-2xl font-semibold text-slate-900">Edit bug</h2>
          <p className="text-sm text-slate-500">
            Adjust metadata, severity, or screenshots. Changes will be saved instantly to Firestore.
          </p>
        </header>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Title
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-300 focus:bg-white focus:outline-none"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-indigo-300 focus:bg-white focus:outline-none min-h-[120px]"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Severity
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-300 focus:outline-none"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            {role === "admin" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </label>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-300 focus:outline-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Invalid</option>
                  <option>Closed</option>
                </select>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Screenshot
            </label>
            <label className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 cursor-pointer hover:border-indigo-200 hover:bg-white transition">
              <span className="font-medium">Replace image</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setScreenshot(file);
                  setPreview(URL.createObjectURL(file));
                }}
              />
            </label>

            {(preview || screenshotURL) && (
              <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <img
                  src={preview || screenshotURL}
                  alt="Screenshot preview"
                  className="w-full h-48 object-cover"
                />
                <Button
                  size="sm"
                  variant="danger"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setScreenshot(null);
                    setPreview("");
                    setScreenshotURL("");
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} loadingText="Updating...">
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
