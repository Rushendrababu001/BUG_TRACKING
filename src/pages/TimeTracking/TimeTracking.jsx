import React, { useState, useEffect } from 'react';
import { FiClock, FiPlus, FiTrash2, FiDownload } from 'react-icons/fi';

import { logBugTime, getTimeLogs, getTotalBugTime, getBillableHoursReport } from '../../services/slaService';
import { getBugs } from '../../services/bugService';
import { useAuth } from '../../hooks/useAuth';
import { exportAuditLogAsCSV } from '../../services/exportService';

/**
 * Time Tracking Page
 * Log work hours, track billable time, generate reports
 */
const TimeTracking = () => {
  const { user } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [selectedBugId, setSelectedBugId] = useState('');
  const [timeLogs, setTimeLogs] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    hours: '',
    billable: true,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const [billableReport, setBillableReport] = useState(null);

  // Load bugs on mount
  useEffect(() => {
    const loadBugs = async () => {
      try {
        const fetchedBugs = await getBugs();
        setBugs(fetchedBugs);
        if (fetchedBugs.length > 0) {
          setSelectedBugId(fetchedBugs[0].id);
        }
      } catch (error) {
        console.error('Error loading bugs:', error);
      }
    };
    loadBugs();
  }, []);

  // Load time logs when bug is selected
  useEffect(() => {
    if (selectedBugId) {
      loadTimeLogs();
    }
  }, [selectedBugId]);

  const loadTimeLogs = async () => {
    try {
      setLoading(true);
      const logs = await getTimeLogs(selectedBugId);
      setTimeLogs(logs);

      const total = await getTotalBugTime(selectedBugId);
      setTotalHours(total);
    } catch (error) {
      console.error('Error loading time logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTime = async (e) => {
    e.preventDefault();
    if (!selectedBugId || !formData.hours) {
      alert('Please select a bug and enter hours');
      return;
    }

    try {
      await logBugTime(selectedBugId, {
        userId: user.uid,
        hours: parseFloat(formData.hours),
        billable: formData.billable,
        description: formData.description,
        date: formData.date,
      });

      // Reset form
      setFormData({
        hours: '',
        billable: true,
        description: '',
        date: new Date().toISOString().split('T')[0],
      });

      // Reload logs
      await loadTimeLogs();
      alert('Time logged successfully');
    } catch (error) {
      console.error('Error logging time:', error);
      alert('Error logging time');
    }
  };

  const handleDeleteTimeLog = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this time log?')) return;

    try {
      // In production, you'd have a deleteTimeLog function
      alert('Time log deletion not yet implemented');
    } catch (error) {
      console.error('Error deleting time log:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const report = await getBillableHoursReport(user.uid, dateRange.from, dateRange.to);
      setBillableReport(report);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    }
  };

  const handleExportReport = () => {
    if (!billableReport) {
      alert('Please generate a report first');
      return;
    }

    const csvContent = [
      ['Billable Hours Report', `${dateRange.from} to ${dateRange.to}`],
      [],
      ['Bug ID', 'Title', 'Hours', 'Total Amount'],
      ...billableReport.map((item) => [
        item.bugId || 'Unknown',
        item.title || 'Unknown',
        item.billableHours || 0,
        `$${(item.billableHours * 50).toFixed(2)}`, // Example rate: $50/hour
      ]),
      [],
      ['Total', '', billableReport.reduce((sum, item) => sum + (item.billableHours || 0), 0), `$${(billableReport.reduce((sum, item) => sum + (item.billableHours || 0), 0) * 50).toFixed(2)}`],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
    element.setAttribute('download', `billable_report_${dateRange.from}_to_${dateRange.to}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const selectedBug = bugs.find((b) => b.id === selectedBugId);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="h-screen overflow-y-auto px-6 py-8 lg:px-10 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Time Tracking</h1>
            <p className="text-sm text-slate-500">Log work hours and track billable time</p>
          </div>
        </header>
        <div>
            {/* Left: Time Entry Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FiPlus className="text-indigo-600" />
                  Log Time
                </h2>

                <form onSubmit={handleAddTime} className="space-y-4">
                  {/* Select Bug */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bug</label>
                    <select
                      value={selectedBugId}
                      onChange={(e) => setSelectedBugId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a bug...</option>
                      {bugs.map((bug) => (
                        <option key={bug.id} value={bug.id}>
                          {bug.bugId}: {bug.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hours */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Hours</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="e.g., 2.5"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <textarea
                      placeholder="What did you work on?"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows="3"
                    />
                  </div>

                  {/* Billable */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="billable"
                      checked={formData.billable}
                      onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <label htmlFor="billable" className="text-sm font-medium text-slate-700">
                      Billable time
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    Log Time
                  </button>
                </form>

                {/* Quick Stats */}
                {selectedBug && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      Bug: <span className="text-indigo-600">{selectedBug.bugId}</span>
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total Hours:</span>
                        <span className="font-semibold text-slate-900">{totalHours.toFixed(1)}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Billable Value:</span>
                        <span className="font-semibold text-emerald-600">${(totalHours * 50).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Time Logs and Report */}
            <div className="lg:col-span-2 space-y-6">
              {/* Time Logs */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FiClock className="text-indigo-600" />
                  Time Logs
                </h2>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="text-slate-500">Loading...</div>
                  </div>
                ) : timeLogs.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <div className="text-slate-500">No time logs yet</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timeLogs.map((log, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl font-bold text-indigo-600 min-w-12">
                              {log.hours}h
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{log.description}</p>
                              <p className="text-sm text-slate-600">
                                {log.date || 'No date'} · {log.billable ? 'Billable' : 'Non-billable'}
                              </p>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTimeLog(log.id)}
                          className="text-slate-400 hover:text-rose-600 transition p-2"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Billable Hours Report */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Billable Hours Report</h2>

                <div className="space-y-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">From</label>
                      <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
                      <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateReport}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    Generate Report
                  </button>
                </div>

                {billableReport && (
                  <div>
                    <div className="space-y-2 mb-4">
                      {billableReport.map((item, index) => (
                        <div key={index} className="flex justify-between p-3 bg-slate-50 rounded">
                          <div>
                            <p className="font-medium text-slate-900">
                              {item.bugId}: {item.title}
                            </p>
                            <p className="text-sm text-slate-600">{item.billableHours} hours</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600">
                              ${(item.billableHours * 50).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                      <p className="font-semibold text-slate-900">Total</p>
                      <p className="text-xl font-bold text-emerald-600">
                        ${(
                          billableReport.reduce((sum, item) => sum + (item.billableHours || 0), 0) * 50
                        ).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={handleExportReport}
                      className="w-full mt-4 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition font-medium"
                    >
                      <FiDownload />
                      Export as CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
      </main>
    </div>
  );
};

export default TimeTracking;
