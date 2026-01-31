import React, { useState } from "react";
import { FiChevronDown, FiCheck } from "react-icons/fi";

export const KanbanBoard = ({ bugs = [], onDragEnd }) => {
  // support lowercase or different status keys from backend
  const statuses = ["open", "inprogress", "resolved", "closed", "invalid"];
  const [draggedBug, setDraggedBug] = useState(null);

  const bugsByStatus = statuses.reduce((acc, statusKey) => {
    acc[statusKey] = bugs.filter((b) => {
      if (!b || !b.status) return false;
      const s = String(b.status).toLowerCase().replace(/\s+/g, "");
      return s === statusKey;
    });
    return acc;
  }, {});

  const handleDragStart = (e, bug) => {
    setDraggedBug(bug);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedBug && draggedBug.status !== newStatus) {
      onDragEnd(draggedBug.id, newStatus);
    }
    setDraggedBug(null);
  };

  const statusColors = {
    open: "bg-purple-50 border-purple-200",
    inprogress: "bg-blue-50 border-blue-200",
    resolved: "bg-teal-50 border-teal-200",
    closed: "bg-slate-50 border-slate-200",
    invalid: "bg-amber-50 border-amber-200",
  };

  const statusBadgeColors = {
    open: "bg-purple-100 text-purple-700",
    inprogress: "bg-blue-100 text-blue-700",
    resolved: "bg-teal-100 text-teal-700",
    closed: "bg-slate-100 text-slate-700",
    invalid: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {statuses.map((statusKey) => (
        <div
          key={statusKey}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, statusKey)}
          className={`rounded-lg border-2 border-dashed ${statusColors[statusKey]} p-4 min-h-96`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">{statusKey === 'inprogress' ? 'In Progress' : statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}</h3>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadgeColors[statusKey]}`}>
              {bugsByStatus[statusKey]?.length || 0}
            </span>
          </div>

          <div className="space-y-3">
            {bugsByStatus[statusKey]?.map((bug) => (
              <div
                key={bug.id}
                draggable
                onDragStart={(e) => handleDragStart(e, bug)}
                className="bg-white rounded-lg border border-slate-200 p-3 cursor-move hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-medium text-slate-900 flex-1">{bug.title}</h4>
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded">
                    #{bug.bugId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{bug.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded-full ${bug.severity === "Critical" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                    {bug.severity}
                  </span>
                  <span className="text-slate-400">{bug.createdByName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
