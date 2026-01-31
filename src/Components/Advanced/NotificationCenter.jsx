import React from "react";
import { FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";

export const NotificationCenter = ({ notifications, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-50 max-w-md w-full">
      {notifications.map((notification) => {
        const iconMap = {
          success: <FiCheckCircle className="w-5 h-5 text-green-600" />,
          error: <FiAlertCircle className="w-5 h-5 text-red-600" />,
          warning: <FiAlertCircle className="w-5 h-5 text-yellow-600" />,
          info: <FiAlertCircle className="w-5 h-5 text-blue-600" />,
        };

        const bgColorMap = {
          success: "bg-green-50 border-green-200",
          error: "bg-red-50 border-red-200",
          warning: "bg-yellow-50 border-yellow-200",
          info: "bg-blue-50 border-blue-200",
        };

        return (
          <div
            key={notification.id}
            className={`flex items-start gap-3 p-4 rounded-lg border ${bgColorMap[notification.type] || bgColorMap.info} animate-slide-in`}
          >
            {iconMap[notification.type]}
            <div className="flex-1">
              <p className="font-semibold text-sm text-slate-900">
                {notification.title}
              </p>
              {notification.message && (
                <p className="text-sm text-slate-600 mt-1">
                  {notification.message}
                </p>
              )}
            </div>
            <button
              onClick={() => onClose(notification.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationCenter;
