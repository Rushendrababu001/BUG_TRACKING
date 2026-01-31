import React, { useState, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';

import { subscribeToBugs } from '../../services/bugService';

const SLADashboard = () => {
  const [bugs, setBugs] = useState([]);
  const [slaStatus, setSLAStatus] = useState({ violated: [], atRisk: [], healthy: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToBugs((fetchedBugs) => {
      setBugs(fetchedBugs);
      evaluateSLAStatus(fetchedBugs);
      setLoading(false);
    });

    return () => unsubscribe?.();
  }, []);

  const evaluateSLAStatus = (bugList) => {
    const violated = [];
    const atRisk = [];
    const healthy = [];

    bugList.forEach((bug) => {
      const createdDate = bug.createdAt?.toDate ? bug.createdAt.toDate() : new Date(bug.createdAt);
      const hoursElapsed = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);

      const severityLower = (bug.severity || '').toLowerCase();
      const slaHours = {
        critical: 4,
        high: 8,
        medium: 24,
        low: 72,
      }[severityLower] || 24;

      const percentUsed = (hoursElapsed / slaHours) * 100;

      if (percentUsed > 100) {
        violated.push(bug);
      } else if (percentUsed > 75) {
        atRisk.push(bug);
      } else {
        healthy.push(bug);
      }
    });

    setSLAStatus({ violated, atRisk, healthy });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    evaluateSLAStatus(bugs);
    setTimeout(() => setRefreshing(false), 500);
  };

  const getFilteredBugs = () => {
    switch (filter) {
      case 'violated':
        return slaStatus.violated || [];
      case 'atRisk':
        return slaStatus.atRisk || [];
      case 'healthy':
        return slaStatus.healthy || [];
      default:
        return bugs;
    }
  };

  const filteredBugs = getFilteredBugs();

  const stats = {
    total: bugs.length,
    violated: slaStatus.violated?.length || 0,
    atRisk: slaStatus.atRisk?.length || 0,
    healthy: slaStatus.healthy?.length || 0,
    violationRate: bugs.length > 0 ? ((slaStatus.violated?.length || 0) / bugs.length * 100).toFixed(2) : '0.00',
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-700',
      'High': 'bg-orange-100 text-orange-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-blue-100 text-blue-700'
    };
    return colors[severity] || 'bg-slate-100 text-slate-700';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-amber-100 text-amber-700',
      'In Progress': 'bg-indigo-100 text-indigo-700',
      'Resolved': 'bg-emerald-100 text-emerald-700',
      'Closed': 'bg-slate-100 text-slate-700',
      'Invalid': 'bg-purple-100 text-purple-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-slate-900">
      <main className="h-screen overflow-y-auto px-6 py-8 lg:px-10 space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Tracker workspace</p>
            <h1 className="text-2xl font-semibold text-slate-900">SLA Monitor</h1>
            <p className="text-sm text-slate-500">Monitor SLA violations and bug health</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 font-medium"
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </header>

        {/* Stats Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          <StatCard title="Total Bugs" value={stats.total} accent="text-slate-900" bg="bg-slate-100" />
          <StatCard title="SLA Violated" value={stats.violated} accent="text-rose-600" bg="bg-rose-50" highlight={stats.violated > 0} />
          <StatCard title="At Risk" value={stats.atRisk} accent="text-amber-600" bg="bg-amber-50" highlight={stats.atRisk > 0} />
          <StatCard title="Healthy" value={stats.healthy} accent="text-emerald-600" bg="bg-emerald-50" />
        </section>

        {/* Violation Rate Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Violation Rate</h3>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-5xl font-bold text-rose-600">{stats.violationRate}%</p>
              <p className="text-sm text-slate-600 mt-2">{stats.violated} of {stats.total} bugs</p>
            </div>
            <div className="flex-1 h-16 bg-slate-100 rounded-lg flex items-end gap-1 p-2">
              <div
                className="flex-1 bg-rose-500 rounded-t"
                style={{ height: stats.total > 0 ? (stats.violated / stats.total) * 100 + '%' : '0%' }}
                title={`Violated: ${stats.violated}`}
              />
              <div
                className="flex-1 bg-amber-500 rounded-t"
                style={{ height: stats.total > 0 ? (stats.atRisk / stats.total) * 100 + '%' : '0%' }}
                title={`At Risk: ${stats.atRisk}`}
              />
              <div
                className="flex-1 bg-emerald-500 rounded-t"
                style={{ height: stats.total > 0 ? (stats.healthy / stats.total) * 100 + '%' : '0%' }}
                title={`Healthy: ${stats.healthy}`}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Bugs', count: stats.total },
            { id: 'violated', label: 'Violated', count: stats.violated },
            { id: 'atRisk', label: 'At Risk', count: stats.atRisk },
            { id: 'healthy', label: 'Healthy', count: stats.healthy },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Bugs Table */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">SLA Status Overview</h3>
            <p className="text-xs text-slate-500 mt-1">Real-time SLA tracking for all bugs.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48 text-slate-500">Loading SLA data...</div>
          ) : filteredBugs.length === 0 ? (
            <div className="flex justify-center items-center h-48 text-slate-500">No bugs in this category</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Bug ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">SLA Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBugs.map((bug, index) => (
                    <tr key={bug.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm text-indigo-600 font-semibold">{bug.bugId}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium truncate max-w-xs">{bug.title}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(bug.severity)}`}>
                          {bug.severity || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bug.status)}`}>
                          {bug.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{bug.assignedTo || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-sm">
                        <SLAStatusBadge bug={bug} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {bug.createdAt
                          ? (bug.createdAt.toDate ? bug.createdAt.toDate() : new Date(bug.createdAt)).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, accent, bg, highlight }) => (
  <div className={`${bg} border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition`}>
    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{title}</p>
    <p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p>
    {highlight && <div className="mt-2 h-1 bg-rose-500 rounded-full"></div>}
  </div>
);

const SLAStatusBadge = ({ bug }) => {
  const createdDate = bug.createdAt?.toDate ? bug.createdAt.toDate() : new Date(bug.createdAt);
  const hoursElapsed = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);

  const severityLower = (bug.severity || '').toLowerCase();
  const slaHours = {
    critical: 4,
    high: 8,
    medium: 24,
    low: 72,
  }[severityLower] || 24;

  const percentUsed = (hoursElapsed / slaHours) * 100;

  if (percentUsed > 100) {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">Violated</span>;
  } else if (percentUsed > 75) {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">At Risk</span>;
  } else {
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Healthy</span>;
  }
};

export default SLADashboard;
