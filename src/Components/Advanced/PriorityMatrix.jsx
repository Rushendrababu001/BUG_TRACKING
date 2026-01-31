import React, { useMemo } from "react";

export const PriorityMatrix = ({ bugs }) => {
  const severityLevels = { Low: 1, Medium: 2, High: 3, Critical: 4 };

  const matrix = useMemo(() => {
    const data = {};
    bugs.forEach((bug) => {
      const severity = severityLevels[bug.severity] || 2;
      const status = bug.status === "Open" ? "open" : "other";
      const key = `${severity}-${status}`;
      if (!data[key]) data[key] = [];
      data[key].push(bug);
    });
    return data;
  }, [bugs]);

  const quadrants = [
    { title: "Do First", color: "bg-red-50 border-red-200", severity: 3, status: "open" },
    { title: "Schedule", color: "bg-orange-50 border-orange-200", severity: 2, status: "open" },
    { title: "Delegate", color: "bg-yellow-50 border-yellow-200", severity: 3, status: "other" },
    { title: "Eliminate", color: "bg-green-50 border-green-200", severity: 2, status: "other" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="text-lg font-semibold mb-6">Priority Matrix</h3>
      <div className="grid grid-cols-2 gap-4">
        {quadrants.map((quad) => {
          const bugsList = matrix[`${quad.severity}-${quad.status}`] || [];
          return (
            <div
              key={`${quad.severity}-${quad.status}`}
              className={`${quad.color} border-2 rounded-lg p-4 min-h-64`}
            >
              <h4 className="font-semibold text-slate-900 mb-3">{quad.title}</h4>
              <div className="space-y-2">
                {bugsList.slice(0, 5).map((bug) => (
                  <div key={bug.id} className="bg-white rounded p-2 text-xs">
                    <p className="font-medium text-slate-700 truncate">{bug.title}</p>
                    <p className="text-slate-500">#{bug.bugId}</p>
                  </div>
                ))}
                {bugsList.length > 5 && (
                  <div className="text-xs text-slate-500 italic">
                    +{bugsList.length - 5} more
                  </div>
                )}
              </div>
              <div className="mt-4 text-sm font-semibold text-slate-600">
                {bugsList.length} bugs
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriorityMatrix;
