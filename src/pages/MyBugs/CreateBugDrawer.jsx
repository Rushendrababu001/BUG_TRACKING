import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebaseConfig";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { createBug } from "../../services/bugService";
import { generateBugId } from "../../Components/CreateBugId";
import ImageAnnotator from "../../Components/ImageAnnotator";
import Button from "../../Components/Button";
import { getProjects } from "../../services/projectService";

export default function CreateBugDrawer({ open, onClose }) {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotURL, setScreenshotURL] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [openAnnotator, setOpenAnnotator] = useState(false);

  // Fetch projects when drawer opens
  useEffect(() => {
    if (!open) return;
    
    const fetchProjects = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userProjects = await getProjects(user.uid);
          setProjects(userProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [open]);

  if (!open) return null;

  // Upload to Cloudinary
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = auth.currentUser;

      // Fetch user profile
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const profileData = userSnap.exists() ? userSnap.data() : {};

      let finalImageURL = screenshotURL;

      // Convert base64 annotated image → blob → upload
      if (screenshotURL) {
        const blob = await fetch(screenshotURL).then((res) => res.blob());
        finalImageURL = await uploadToCloudinary(blob);
      }

      const bugId = await generateBugId();

      const created = await createBug({
        bugId,
        title,
        description,
        severity,
        screenshotURL: finalImageURL || "",
        status: "Open",
        projectId: projectId || null,
        createdBy: auth.currentUser.uid,
        createdByName: profileData.username || "",
        watchers: [],
        tags: [],
      });

      // Reset form
      setTitle("");
      setDescription("");
      setSeverity("Low");
      setProjectId("");
      setScreenshot(null);
      setScreenshotURL("");
      setPreview("");
      setOpenAnnotator(false);

      onClose();
    } catch (err) {
      console.error(err);
      alert("Error submitting bug!");
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
          <p className="text-xs uppercase tracking-wide text-slate-400">New issue</p>
          <h2 className="text-2xl font-semibold text-slate-900">Create a bug</h2>
          <p className="text-sm text-slate-500">
            Provide a concise title, context, and attach a screenshot so the team can reproduce quickly.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Title
            </label>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-300 focus:bg-white focus:outline-none"
              placeholder="Brief summary..."
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
              placeholder="Steps to reproduce, expected behavior, environment..."
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
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Project
              </label>
              <select
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-indigo-300 focus:outline-none"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Screenshot
            </label>
            <label
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 cursor-pointer hover:border-indigo-200 hover:bg-white transition"
            >
              <span className="font-medium">Drop file or click to upload</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setScreenshot(file);
                  const url = URL.createObjectURL(file);
                  setPreview(url);
                  setOpenAnnotator(true);
                }}
              />
            </label>

            {preview && (
              <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <img
                  src={screenshotURL || preview}
                  alt="Bug preview"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setOpenAnnotator(true)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      setScreenshot(null);
                      setPreview("");
                      setScreenshotURL("");
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} loadingText="Uploading...">
              Submit bug
            </Button>
          </div>
        </form>
      </div>

      {openAnnotator && (
        <ImageAnnotator
          imageUrl={preview}
          onSave={(annotatedImage) => {
            setScreenshotURL(annotatedImage);
            setOpenAnnotator(false);
          }}
          onClose={() => setOpenAnnotator(false)}
        />
      )}
    </>
  );
}
