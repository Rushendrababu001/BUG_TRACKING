import React from 'react';
import { formatDate } from '../utils';

export default function MyWorkPanel({ recentBugs = [] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-100 p-6 min-h-[220px] shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">My Bugs</h3>
        {recentBugs.length === 0 ? (
          <p className="text-sm text-slate-400">No bugs found</p>
        ) : (
          <ul className="space-y-3">
            {recentBugs.map((b) => (
              <li key={b.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-150 cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 group-hover:text-indigo-700 transition">{b.title}</div>
                    <div className="text-xs text-slate-500 mt-1">{b.owner}</div>
                  </div>
                  <div className="text-xs text-slate-400 ml-2 whitespace-nowrap">{formatDate(b.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 min-h-[220px] shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-lg font-semibold mb-4 text-slate-900">My Work Items Due Today</h3>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-slate-600 font-medium">Great work!</p>
            <p className="text-xs text-slate-400 mt-1">You don't have any overdue items.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
