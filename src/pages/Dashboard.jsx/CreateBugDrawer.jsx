import React, { useState } from "react";
import { db, auth } from "../../firebaseConfig";
import { doc, getDoc, addDoc, collection, Timestamp } from "firebase/firestore";

export default function CreateBugDrawer({ open, onClose }) {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotURL, setScreenshotURL] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  // Cloudinary Upload
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Rushendrababu"); // 🔴 Replace

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dy3avdacj/image/upload`, // 🔴 Replace
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
       const user = auth.currentUser;

    // Fetch Firestore user profile
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const profileData = userSnap.exists() ? userSnap.data() : {};


      let finalImageURL = screenshotURL;

      if (screenshot) {
        finalImageURL = await uploadToCloudinary(screenshot);
      }

      await addDoc(collection(db, "bugs"), {
        title,
        description,
        severity,
        screenshotURL: finalImageURL || "",
        status: "Open",
        createdBy: auth.currentUser.uid,
        createdByName: profileData.username || "",
        createdAt: Timestamp.now(),
      });

      // Reset
      setTitle("");
      setDescription("");
      setSeverity("Low");
      setScreenshot(null);
      setScreenshotURL("");
      setPreview("");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error submitting bug!");
    }

    setLoading(false);
  };

  return (
    <>
      {/* Background Blur */}
      <div
        className="fixed inset-0 bg-gray bg-opacity-30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed top-0 right-0 w-96 h-full bg-white shadow-xl z-50 p-6 animate-[slide_0.3s_ease] overflow-y-auto">
        <style>
          {`@keyframes slide {
              from { transform: translateX(100%); }
              to   { transform: translateX(0); }
            }`}
        </style>

        <h2 className="text-2xl font-bold mb-5">Report a Bug</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Title */}
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              className="w-full border p-2 rounded-lg mt-1"
              placeholder="Bug title..."
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full border p-2 rounded-lg mt-1"
              rows={3}
              placeholder="Describe the issue..."
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Severity */}
          <div>
            <label className="text-sm font-medium">Severity</label>
            <select
              className="w-full border p-2 rounded-lg mt-1"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="text-sm font-medium">Screenshot</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border p-2 rounded-lg mt-1"
              onChange={(e) => {
                const file = e.target.files[0];
                setScreenshot(file);
                setPreview(URL.createObjectURL(file));
              }}
            />
          </div>

          {/* Preview with Remove Button */}
          {preview && (
            <div className="relative mt-2">
              <img
                src={preview}
                alt="preview"
                className="w-full h-40 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => {
                  setScreenshot(null);
                  setPreview("");
                }}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-1 text-xs hover:bg-red-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 pb-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
            >
              {loading ? "Uploading..." : "Submit Bug"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
