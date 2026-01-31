import React, { useMemo } from "react";

export const BugReports = ({ bugs }) => {
  const report = useMemo(() => {
    const data = {
      byStatus: {},
      bySeverity: {},
      byUser: {},
      avgResolutionTime: 0,
      totalCritical: 0,
    };

    bugs.forEach((bug) => {
      // By Status
      data.byStatus[bug.status] = (data.byStatus[bug.status] || 0) + 1;

      // By Severity
      data.bySeverity[bug.severity] = (data.bySeverity[bug.severity] || 0) + 1;
      if (bug.severity === "Critical") data.totalCritical++;

      // By User
      data.byUser[bug.createdByName || "Unknown"] = (data.byUser[bug.createdByName || "Unknown"] || 0) + 1;
    });

    return data;
  }, [bugs]);

  const topReporters = useMemo(() => {
    return Object.entries(report.byUser)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [report]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h4 className="text-sm font-semibold text-slate-600 uppercase">By Status</h4>
          <div className="mt-4 space-y-2">
            {Object.entries(report.byStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between">
                <span className="text-sm text-slate-700">{status}</span>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h4 className="text-sm font-semibold text-slate-600 uppercase">By Severity</h4>
          <div className="mt-4 space-y-2">
            {Object.entries(report.bySeverity).map(([severity, count]) => (
              <div key={severity} className="flex justify-between">
                <span className="text-sm text-slate-700">{severity}</span>
                <span className="font-semibold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h4 className="text-sm font-semibold text-slate-600 uppercase">Critical Stats</h4>
          <div className="mt-4">
            <p className="text-3xl font-bold text-red-600">{report.totalCritical}</p>
            <p className="text-xs text-slate-500 mt-1">Critical issues require immediate attention</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Top Reporters</h4>
        <div className="space-y-3">
          {topReporters.map((reporter, idx) => (
            <div key={reporter.name} className="flex items-center gap-4">
              <span className="text-2xl font-bold text-slate-300">#{idx + 1}</span>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{reporter.name}</p>
              </div>
              <span className="text-2xl font-bold text-indigo-600">{reporter.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BugReports;
