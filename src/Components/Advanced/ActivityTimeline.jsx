import React from "react";
import { FiActivity, FiEdit, FiTrash2, FiCheckCircle, FiClock } from "react-icons/fi";
import { formatDateTime, getTimeAgo } from "../../utils";

export const ActivityTimeline = ({ activities }) => {
  const activityIcons = {
    created: <FiActivity className="w-4 h-4" />,
    updated: <FiEdit className="w-4 h-4" />,
    deleted: <FiTrash2 className="w-4 h-4" />,
    resolved: <FiCheckCircle className="w-4 h-4" />,
    commented: <FiActivity className="w-4 h-4" />,
  };

  const activityColors = {
    created: "bg-blue-100 text-blue-700",
    updated: "bg-yellow-100 text-yellow-700",
    deleted: "bg-red-100 text-red-700",
    resolved: "bg-green-100 text-green-700",
    commented: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-6">
      {activities.map((activity, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`p-2 rounded-full ${activityColors[activity.type] || "bg-gray-100"}`}>
              {activityIcons[activity.type]}
            </div>
            {index !== activities.length - 1 && (
              <div className="w-0.5 h-12 bg-slate-200 mt-2" />
            )}
          </div>

          <div className="flex-1 pt-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-900">{activity.title}</p>
              <span className="text-xs text-slate-500">
                {getTimeAgo(activity.timestamp)}
              </span>
            </div>
            {activity.description && (
              <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
            )}
            <p className="text-xs text-slate-400 mt-1">by {activity.user}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
