import React, { useState } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { bulkUpdateBugs, bulkDeleteBugs } from "../../services/bugService";

export const BulkActionsToolbar = ({ selectedBugIds, onComplete }) => {
  const [submitting, setSubmitting] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const handleBulkStatusUpdate = async () => {
    if (!newStatus) return;
    setSubmitting(true);
    try {
      await bulkUpdateBugs(selectedBugIds, { status: newStatus });
      setNewStatus("");
      onComplete();
    } catch (error) {
      console.error("Error updating bugs:", error);
    }
    setSubmitting(false);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedBugIds.length} bug(s)?`)) return;
    setSubmitting(true);
    try {
      await bulkDeleteBugs(selectedBugIds);
      onComplete();
    } catch (error) {
      console.error("Error deleting bugs:", error);
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex flex-wrap items-center gap-4">
      <span className="font-medium text-indigo-900">{selectedBugIds.length} selected</span>

      <select
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
        className="px-3 py-2 border border-indigo-300 rounded-lg text-sm bg-white"
      >
        <option value="">Change Status...</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>

      <button
        onClick={handleBulkStatusUpdate}
        disabled={!newStatus || submitting}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
      >
        <FiCheck className="w-4 h-4" />
        Update
      </button>

      <button
        onClick={handleBulkDelete}
        disabled={submitting}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
      >
        <FiX className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
};

export default BulkActionsToolbar;
