import React, { useState, useEffect } from 'react';
import { FiDownload, FiFilter, FiCalendar } from 'react-icons/fi';

import { subscribeToBugs } from '../../services/bugService';
import { getActivityLogs } from '../../services/commentService';
import { exportBugsAsCSV, exportAuditLogAsCSV } from '../../services/exportService';

/**
 * Reports Page
 * Generate and view various reports on bug tracking
 */
const Reports = () => {
  const [bugs, setBugs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(true);

  // Load bugs
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToBugs((fetchedBugs) => {
      setBugs(fetchedBugs);
      setLoading(false);
    });

    return () => unsubscribe?.();
  }, []);

  // Load activity logs
  useEffect(() => {
    const loadLogs = async () => {
      try {
        if (bugs.length > 0) {
          const logs = await Promise.all(bugs.map((bug) => getActivityLogs(bug.id)));
          setActivityLogs(logs.flat());
        }
      } catch (error) {
        console.error('Error loading activity logs:', error);
      }
    };
    loadLogs();
  }, [bugs]);

  // Filter bugs by date range
  const getFilteredBugs = () => {
    return bugs.filter((bug) => {
      const bugDate = bug.createdAt ? new Date(bug.createdAt.seconds * 1000) : new Date();
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      return bugDate >= fromDate && bugDate <= toDate;
    });
  };

  const filteredBugs = getFilteredBugs();

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      total: filteredBugs.length,
      open: filteredBugs.filter((b) => b.status === 'open').length,
      inProgress: filteredBugs.filter((b) => b.status === 'in-progress').length,
      resolved: filteredBugs.filter((b) => b.status === 'resolved').length,
      closed: filteredBugs.filter((b) => b.status === 'closed').length,
      critical: filteredBugs.filter((b) => b.severity === 'critical').length,
      high: filteredBugs.filter((b) => b.severity === 'high').length,
      medium: filteredBugs.filter((b) => b.severity === 'medium').length,
      low: filteredBugs.filter((b) => b.severity === 'low').length,
    };

    return stats;
  };

  const stats = calculateStats();

  const handleExportBugs = () => {
    exportBugsAsCSV(filteredBugs, `bugs_report_${dateRange.from}_to_${dateRange.to}.csv`);
  };

  const handleExportActivityLog = () => {
    exportAuditLogAsCSV(activityLogs, `activity_log_${dateRange.from}_to_${dateRange.to}.csv`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="flex-1 overflow-auto px-6 py-8 lg:px-10 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Reports</h1>
            <p className="text-sm text-slate-500">View analytics and generate reports</p>
          </div>
        </header>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <FiCalendar className="text-indigo-600" />
            <div className="flex gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">From</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="flex gap-2 mb-6">
          {['overview', 'severity', 'status', 'timeline'].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                reportType === type ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {type === 'overview' ? 'Overview' : type === 'severity' ? 'By Severity' : type === 'status' ? 'By Status' : 'Timeline'}
            </button>
          ))}
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="text-slate-500">Loading report data...</div>
          </div>
        ) : (
          <>
            {reportType === 'overview' && <OverviewReport stats={stats} bugsCount={filteredBugs.length} />}
            {reportType === 'severity' && <SeverityReport stats={stats} bugs={filteredBugs} />}
            {reportType === 'status' && <StatusReport stats={stats} bugs={filteredBugs} />}
            {reportType === 'timeline' && <TimelineReport bugs={filteredBugs} />}

            {/* Export Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleExportBugs}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                <FiDownload />
                Export Bugs as CSV
              </button>
              <button
                onClick={handleExportActivityLog}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
              >
                <FiDownload />
                Export Activity Log
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

/**
 * Overview Report Component
 */
const OverviewReport = ({ stats, bugsCount }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Summary Statistics</h2>
        <div className="space-y-3">
          {[
            { label: 'Total Bugs', value: stats.total, color: 'indigo' },
            { label: 'Open', value: stats.open, color: 'slate' },
            { label: 'In Progress', value: stats.inProgress, color: 'amber' },
            { label: 'Resolved', value: stats.resolved, color: 'emerald' },
            { label: 'Closed', value: stats.closed, color: 'emerald' },
          ].map((item) => (
            <div key={item.label} className="flex justify-between items-center p-3 bg-slate-50 rounded">
              <span className="text-slate-700 font-medium">{item.label}</span>
              <span className={`text-2xl font-bold text-${item.color}-600`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Severity Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Severity Distribution</h2>
        <div className="space-y-3">
          {[
            { label: 'Critical', value: stats.critical, color: 'rose' },
            { label: 'High', value: stats.high, color: 'orange' },
            { label: 'Medium', value: stats.medium, color: 'amber' },
            { label: 'Low', value: stats.low, color: 'emerald' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-slate-700 font-medium w-16">{item.label}</span>
              <div className="flex-1 h-8 bg-slate-100 rounded flex items-center overflow-hidden">
                <div
                  className={`h-full bg-${item.color}-500 flex items-center justify-end pr-2 text-white text-xs font-semibold`}
                  style={{
                    width: stats.total > 0 ? (item.value / stats.total) * 100 + '%' : '0%',
                  }}
                >
                  {item.value > 0 ? item.value : ''}
                </div>
              </div>
              <span className="text-slate-700 font-semibold w-8 text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Severity Report Component
 */
const SeverityReport = ({ stats, bugs }) => {
  const severities = ['critical', 'high', 'medium', 'low'];
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Bugs by Severity</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Severity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Count</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Percentage</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status Distribution</th>
            </tr>
          </thead>
          <tbody>
            {severities.map((severity) => {
              const count = stats[severity];
              const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
              const bugsOfSeverity = bugs.filter((b) => b.severity === severity);
              const statusDist = {
                open: bugsOfSeverity.filter((b) => b.status === 'open').length,
                inProgress: bugsOfSeverity.filter((b) => b.status === 'in-progress').length,
                resolved: bugsOfSeverity.filter((b) => b.status === 'resolved').length,
              };

              return (
                <tr key={severity} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm font-semibold text-slate-900 capitalize">{severity}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{count}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{percentage}%</td>
                  <td className="px-6 py-3 text-sm text-slate-600">
                    Open: {statusDist.open} | In Progress: {statusDist.inProgress} | Resolved:{' '}
                    {statusDist.resolved}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Status Report Component
 */
const StatusReport = ({ stats, bugs }) => {
  const statuses = ['open', 'in-progress', 'resolved', 'closed'];
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Bugs by Status</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Count</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Percentage</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Avg Days Open</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((status) => {
              const count = stats[status.replace('-', '')];
              const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
              const bugsOfStatus = bugs.filter((b) => b.status === status);
              const avgDays =
                bugsOfStatus.length > 0
                  ? (
                      bugsOfStatus.reduce((sum, b) => {
                        const days = (Date.now() - (b.createdAt?.seconds * 1000 || Date.now())) / (1000 * 60 * 60 * 24);
                        return sum + days;
                      }, 0) / bugsOfStatus.length
                    ).toFixed(1)
                  : 0;

              return (
                <tr key={status} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-3 text-sm font-semibold text-slate-900 capitalize">{status}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{count}</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{percentage}%</td>
                  <td className="px-6 py-3 text-sm text-slate-600">{avgDays} days</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Timeline Report Component
 */
const TimelineReport = ({ bugs }) => {
  // Group bugs by week
  const groupByWeek = () => {
    const weeks = {};
    bugs.forEach((bug) => {
      const date = bug.createdAt ? new Date(bug.createdAt.seconds * 1000) : new Date();
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) {
        weeks[weekKey] = { created: 0, resolved: 0, closed: 0 };
      }

      if (bug.status === 'resolved' || bug.status === 'closed') {
        weeks[weekKey][bug.status === 'closed' ? 'closed' : 'resolved']++;
      } else {
        weeks[weekKey].created++;
      }
    });

    return Object.entries(weeks)
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12); // Last 12 weeks
  };

  const weeklyData = groupByWeek();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Weekly Activity Timeline</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Week of</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Resolved</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Closed</th>
            </tr>
          </thead>
          <tbody>
            {weeklyData.map((week, index) => (
              <tr key={week.week} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="px-6 py-3 text-sm text-slate-600">{new Date(week.week).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-sm font-semibold text-slate-900">{week.created}</td>
                <td className="px-6 py-3 text-sm font-semibold text-emerald-600">{week.resolved}</td>
                <td className="px-6 py-3 text-sm font-semibold text-emerald-700">{week.closed}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    );
}

export default Reports;
