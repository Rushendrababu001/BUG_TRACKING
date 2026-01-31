import React from 'react';
import { useBugContext } from '../contexts';

const Card = ({ title, value, accent }) => (
  <div className={`flex-1 min-w-40 p-5 rounded-xl bg-white shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200 cursor-default group`}>
    <div className="flex items-center justify-between mb-3">
      <div className="text-sm font-medium text-slate-600">{title}</div>
      <div className={`text-xs px-2.5 py-1 rounded-full text-white font-semibold ${accent} opacity-90 group-hover:opacity-100 transition`}></div>
    </div>
    <div className="text-3xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{value}</div>
    <div className="mt-2 h-1 w-12 bg-gradient-to-r from-slate-200 to-transparent rounded-full group-hover:w-16 transition-all duration-300"></div>
  </div>
);

export default function SummaryCards() {
  const { stats } = useBugContext();
  return (
    <div className="flex gap-4 animate-fade-in">
      <Card title="Open Bugs" value={stats.open || 0} accent="bg-amber-500" />
      <Card title="In Progress" value={stats.inprogress || 0} accent="bg-indigo-500" />
      <Card title="Resolved" value={stats.resolved || 0} accent="bg-emerald-500" />
      <Card title="Invalid" value={stats.invalid || 0} accent="bg-slate-400" />
    </div>
  );
}
