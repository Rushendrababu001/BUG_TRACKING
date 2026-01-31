import React from "react";

export const ProgressBar = ({ value, max = 100, size = "md", color = "indigo" }) => {
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const colorClasses = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
    amber: "bg-amber-500",
  };

  const percentage = (value / max) * 100;

  return (
    <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
      <div
        className={`h-full transition-all duration-300 rounded-full ${colorClasses[color]}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};

export const StatsCard = ({ title, value, subtitle, icon, trend, color = "indigo" }) => {
  const colorMap = {
    indigo: { bg: "bg-indigo-50", accent: "text-indigo-600" },
    emerald: { bg: "bg-emerald-50", accent: "text-emerald-600" },
    rose: { bg: "bg-rose-50", accent: "text-rose-600" },
    amber: { bg: "bg-amber-50", accent: "text-amber-600" },
  };

  return (
    <div className={`${colorMap[color].bg} rounded-2xl border border-slate-100 p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">{title}</p>
          <p className={`text-3xl font-bold ${colorMap[color].accent} mt-1`}>{value}</p>
        </div>
        {icon && <div className={`text-3xl ${colorMap[color].accent}`}>{icon}</div>}
      </div>
      {subtitle && <p className="text-xs text-slate-600">{subtitle}</p>}
      {trend && <p className="text-xs text-emerald-600 font-semibold mt-2">{trend}</p>}
    </div>
  );
};

export const Badge = ({ children, color = "slate", variant = "solid" }) => {
  const colorMap = {
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-100 text-indigo-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${colorMap[color]}`}>
      {children}
    </span>
  );
};

export default { ProgressBar, StatsCard, Badge };
