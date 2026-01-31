import React, { createContext, useState, useCallback, useContext } from "react";

export const UIContext = createContext();

export const UIProvider = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = { id, ...notification };
    setNotifications((prev) => [newNotification, ...prev]);

    if (notification.duration !== Infinity) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 3000);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const value = {
    sidebarOpen,
    toggleSidebar,
    theme,
    toggleTheme,
    notifications,
    addNotification,
    removeNotification,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUIContext = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUIContext must be used within UIProvider");
  }
  return context;
};
