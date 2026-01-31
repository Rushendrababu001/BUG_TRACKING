import React, { useMemo } from "react";
import { formatDate } from "../../utils";

export const GanttChart = ({ bugs }) => {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  const getBugPosition = (bug) => {
    if (!bug.createdAt || !bug.dueDate) return null;

    const created = bug.createdAt.toDate ? bug.createdAt.toDate() : new Date(bug.createdAt);
    const due = new Date(bug.dueDate);

    const startOffset = Math.max(0, Math.ceil((created - startDate) / (1000 * 60 * 60 * 24)));
    const duration = Math.ceil((due - created) / (1000 * 60 * 60 * 24));

    return {
      startOffset: (startOffset / daysDiff) * 100,
      duration: (Math.max(1, duration) / daysDiff) * 100,
    };
  };

  const statusColors = {
    Open: "bg-purple-500",
    "In Progress": "bg-blue-500",
    Resolved: "bg-green-500",
    Closed: "bg-slate-400",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 overflow-x-auto">
      <h3 className="text-lg font-semibold mb-6">Timeline View</h3>

      <div className="space-y-4 min-w-max">
        {bugs
          .filter((b) => b.dueDate)
          .map((bug) => {
            const position = getBugPosition(bug);
            if (!position) return null;

            return (
              <div key={bug.id} className="flex items-center gap-4">
                <div className="w-48 truncate">
                  <p className="font-medium text-sm text-slate-900">{bug.title}</p>
                  <p className="text-xs text-slate-500">#{bug.bugId}</p>
                </div>

                <div className="flex-1 h-8 bg-slate-100 rounded relative">
                  <div
                    className={`h-full rounded flex items-center justify-end pr-2 text-xs font-semibold text-white transition-all ${
                      statusColors[bug.status] || "bg-slate-400"
                    }`}
                    style={{
                      marginLeft: `${position.startOffset}%`,
                      width: `${position.duration}%`,
                      minWidth: "50px",
                    }}
                  >
                    {bug.severity === "Critical" && "🔥"}
                  </div>
                </div>

                <div className="w-24 text-right">
                  <p className="text-xs text-slate-600">
                    {formatDate(bug.dueDate)}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default GanttChart;
