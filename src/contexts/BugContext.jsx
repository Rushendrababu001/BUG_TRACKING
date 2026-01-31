import React, { createContext, useState, useCallback, useContext, useEffect } from "react";
import { getBugs, subscribeToBugs } from "../services/bugService";
import { calculateStats } from "../utils/bugUtils";

export const BugContext = createContext();

export const BugProvider = ({ children }) => {
  const [bugs, setBugs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    severity: "",
    assignee: "",
  });

  // Initialize bugs subscription
  useEffect(() => {
    const unsubscribe = subscribeToBugs((bugsData) => {
      setBugs(bugsData);
      setStats(calculateStats(bugsData));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addBug = useCallback((newBug) => {
    setBugs((prev) => [newBug, ...prev]);
    setStats(calculateStats([newBug, ...bugs]));
  }, [bugs]);

  const updateBugLocal = useCallback((bugId, updates) => {
    setBugs((prev) =>
      prev.map((bug) => (bug.id === bugId ? { ...bug, ...updates } : bug))
    );
    setStats(calculateStats(bugs));
  }, [bugs]);

  const removeBugLocal = useCallback((bugId) => {
    setBugs((prev) => prev.filter((bug) => bug.id !== bugId));
    setStats(calculateStats(bugs));
  }, [bugs]);

  const filterBugsList = useCallback((bugs) => {
    return bugs.filter((bug) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (
          !bug.title?.toLowerCase().includes(query) &&
          !bug.bugId?.toString().includes(query) &&
          !bug.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (filters.status && bug.status !== filters.status) return false;
      if (filters.severity && bug.severity !== filters.severity) return false;
      if (filters.assignee && bug.assignedTo !== filters.assignee) return false;
      return true;
    });
  }, [filters]);

  const value = {
    bugs,
    filteredBugs: filterBugsList(bugs),
    stats,
    loading,
    error,
    filters,
    setFilters,
    addBug,
    updateBugLocal,
    removeBugLocal,
  };

  return <BugContext.Provider value={value}>{children}</BugContext.Provider>;
};

export const useBugContext = () => {
  const context = useContext(BugContext);
  if (!context) {
    throw new Error("useBugContext must be used within BugProvider");
  }
  return context;
};
