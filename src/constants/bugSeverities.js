export const BUG_SEVERITIES = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const SEVERITY_COLORS = {
  [BUG_SEVERITIES.LOW]: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  [BUG_SEVERITIES.MEDIUM]: "bg-amber-50 text-amber-700 ring-amber-600/20",
  [BUG_SEVERITIES.HIGH]: "bg-rose-50 text-rose-700 ring-rose-600/20",
  [BUG_SEVERITIES.CRITICAL]: "bg-red-100 text-red-800 ring-red-600/30 font-bold",
};

export const SEVERITY_ICONS = {
  [BUG_SEVERITIES.LOW]: "🟢",
  [BUG_SEVERITIES.MEDIUM]: "🟡",
  [BUG_SEVERITIES.HIGH]: "🔴",
  [BUG_SEVERITIES.CRITICAL]: "🔥",
};

export const SEVERITY_LEVELS = {
  [BUG_SEVERITIES.LOW]: 1,
  [BUG_SEVERITIES.MEDIUM]: 2,
  [BUG_SEVERITIES.HIGH]: 3,
  [BUG_SEVERITIES.CRITICAL]: 4,
};
