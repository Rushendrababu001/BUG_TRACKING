export const BUG_STATUSES = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REOPENED: "Reopened",
  ON_HOLD: "On Hold",
};

export const STATUS_COLORS = {
  [BUG_STATUSES.OPEN]: "bg-purple-50 text-purple-700 ring-purple-700/10",
  [BUG_STATUSES.IN_PROGRESS]: "bg-blue-50 text-blue-700 ring-blue-700/10",
  [BUG_STATUSES.RESOLVED]: "bg-teal-50 text-teal-700 ring-teal-600/20",
  [BUG_STATUSES.CLOSED]: "bg-slate-50 text-slate-600 ring-slate-500/10",
  [BUG_STATUSES.REOPENED]: "bg-orange-50 text-orange-700 ring-orange-600/20",
  [BUG_STATUSES.ON_HOLD]: "bg-gray-50 text-gray-700 ring-gray-600/20",
};

export const STATUS_ICONS = {
  [BUG_STATUSES.OPEN]: "⭕",
  [BUG_STATUSES.IN_PROGRESS]: "🔄",
  [BUG_STATUSES.RESOLVED]: "✅",
  [BUG_STATUSES.CLOSED]: "🚫",
  [BUG_STATUSES.REOPENED]: "🔄",
  [BUG_STATUSES.ON_HOLD]: "⏸️",
};
