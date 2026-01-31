export const calculateStats = (bugs) => {
  return {
    total: bugs.length,
    open: bugs.filter((b) => b.status?.toLowerCase() === "open").length,
    inprogress: bugs.filter((b) => b.status?.toLowerCase() === "in progress" || b.status?.toLowerCase() === "inprogress").length,
    resolved: bugs.filter((b) => b.status?.toLowerCase() === "resolved").length,
    closed: bugs.filter((b) => b.status?.toLowerCase() === "closed").length,
    invalid: bugs.filter((b) => b.status?.toLowerCase() === "invalid").length,
    critical: bugs.filter((b) => b.severity?.toLowerCase() === "critical" || b.severity?.toLowerCase() === "high").length,
    overdue: bugs.filter((b) => b.dueDate && new Date(b.dueDate) < new Date() && b.status?.toLowerCase() !== "resolved").length,
  };
};

export const groupBugsByStatus = (bugs) => {
  const grouped = {};
  bugs.forEach((bug) => {
    if (!grouped[bug.status]) {
      grouped[bug.status] = [];
    }
    grouped[bug.status].push(bug);
  });
  return grouped;
};

export const groupBugsBySeverity = (bugs) => {
  const grouped = {};
  bugs.forEach((bug) => {
    if (!grouped[bug.severity]) {
      grouped[bug.severity] = [];
    }
    grouped[bug.severity].push(bug);
  });
  return grouped;
};

export const sortBugs = (bugs, field, order = "asc") => {
  return [...bugs].sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    if (field === "createdAt" || field === "dueDate") {
      valA = valA?.toDate ? valA.toDate() : new Date(valA);
      valB = valB?.toDate ? valB.toDate() : new Date(valB);
    }

    if (valA < valB) return order === "asc" ? -1 : 1;
    if (valA > valB) return order === "asc" ? 1 : -1;
    return 0;
  });
};

export const filterBugs = (bugs, filters) => {
  return bugs.filter((bug) => {
    if (filters.status && bug.status !== filters.status) return false;
    if (filters.severity && bug.severity !== filters.severity) return false;
    if (filters.assignee && bug.assignedTo !== filters.assignee) return false;
    if (filters.search) {
      const query = filters.search.toLowerCase();
      return (
        bug.title?.toLowerCase().includes(query) ||
        bug.bugId?.toString().includes(query) ||
        bug.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });
};
