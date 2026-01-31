import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Advanced bug search with multiple filters
 * Supports: search (title/description), severity, status, assignee, tags, date range
 * @param {Object} filters - Filter criteria
 * @returns {Promise<Array>} Matching bugs
 */
export const advancedSearch = async (filters = {}) => {
  try {
    const bugsRef = collection(db, "bugs");
    const conditions = [];

    // Build Firestore conditions
    if (filters.status) {
      conditions.push(where("status", "==", filters.status));
    }
    if (filters.severity) {
      conditions.push(where("severity", "==", filters.severity));
    }
    if (filters.assignee) {
      conditions.push(where("assignedTo", "==", filters.assignee));
    }
    if (filters.createdBy) {
      conditions.push(where("createdBy", "==", filters.createdBy));
    }

    // Tags filter (array-contains any tag)
    if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
      // Note: Firestore doesn't support OR on array-contains; do multiple queries
      // For now, we'll filter client-side
    }

    // Date range filters
    if (filters.createdAfter) {
      conditions.push(
        where(
          "createdAt",
          ">=",
          filters.createdAfter instanceof Timestamp ? filters.createdAfter : Timestamp.fromDate(filters.createdAfter)
        )
      );
    }
    if (filters.createdBefore) {
      conditions.push(
        where(
          "createdAt",
          "<=",
          filters.createdBefore instanceof Timestamp ? filters.createdBefore : Timestamp.fromDate(filters.createdBefore)
        )
      );
    }

    // Build and execute query
    const q = query(bugsRef, ...conditions, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    let results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Client-side filters for text search and tags
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (bug) =>
          bug.title?.toLowerCase().includes(searchLower) ||
          bug.description?.toLowerCase().includes(searchLower) ||
          bug.bugId?.toString().includes(searchLower)
      );
    }

    if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
      results = results.filter((bug) =>
        filters.tags.some((tag) => bug.tags?.includes(tag))
      );
    }

    return results;
  } catch (error) {
    console.error("Error performing advanced search:", error);
    throw error;
  }
};

/**
 * Save a search filter for quick reuse
 * @param {string} userId - User ID
 * @param {Object} filterConfig - Filter criteria to save
 * @returns {Promise<Object>} Saved filter with ID
 */
export const saveFilter = async (userId, filterConfig) => {
  try {
    const filtersRef = collection(db, "users", userId, "saved_filters");
    const docRef = await addDoc(filtersRef, {
      ...filterConfig,
      name: filterConfig.name || "Unnamed Filter",
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...filterConfig };
  } catch (error) {
    console.error("Error saving filter:", error);
    throw error;
  }
};

/**
 * Get all saved filters for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Saved filters
 */
export const getSavedFilters = async (userId) => {
  try {
    const filtersRef = collection(db, "users", userId, "saved_filters");
    const snapshot = await getDocs(filtersRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching saved filters:", error);
    return [];
  }
};

/**
 * Get bugs by assignee for workload distribution
 * @param {string} assigneeId - User ID
 * @returns {Promise<Object>} { assigned: [], byStatus: { Open: [], ... }, total }
 */
export const getAssigneeWorkload = async (assigneeId) => {
  try {
    const bugsRef = collection(db, "bugs");
    const q = query(bugsRef, where("assignedTo", "==", assigneeId));
    const snapshot = await getDocs(q);
    const assigned = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Group by status
    const byStatus = {};
    assigned.forEach((bug) => {
      const status = bug.status || "Open";
      if (!byStatus[status]) byStatus[status] = [];
      byStatus[status].push(bug);
    });

    return {
      assigned,
      byStatus,
      total: assigned.length,
      distribution: Object.keys(byStatus).reduce(
        (acc, status) => ({
          ...acc,
          [status]: byStatus[status].length,
        }),
        {}
      ),
    };
  } catch (error) {
    console.error("Error fetching assignee workload:", error);
    throw error;
  }
};

/**
 * Get high-priority bugs requiring attention
 * @returns {Promise<Array>} Bugs with high severity or status "Open"
 */
export const getHighPriorityBugs = async () => {
  try {
    const bugsRef = collection(db, "bugs");

    // Query for critical/high severity
    const severityQuery = query(
      bugsRef,
      where("severity", "in", ["Critical", "High"]),
      orderBy("createdAt", "desc")
    );

    // Query for open bugs
    const statusQuery = query(
      bugsRef,
      where("status", "==", "Open"),
      orderBy("createdAt", "desc")
    );

    const [severitySnap, statusSnap] = await Promise.all([
      getDocs(severityQuery),
      getDocs(statusQuery),
    ]);

    // Merge and deduplicate
    const bugMap = new Map();
    [...severitySnap.docs, ...statusSnap.docs].forEach((doc) => {
      bugMap.set(doc.id, { id: doc.id, ...doc.data() });
    });

    return Array.from(bugMap.values());
  } catch (error) {
    console.error("Error fetching high-priority bugs:", error);
    return [];
  }
};

/**
 * Get recently updated bugs
 * @param {number} hoursAgo - How many hours back to look (default 24)
 * @returns {Promise<Array>} Recently updated bugs
 */
export const getRecentlyUpdated = async (hoursAgo = 24) => {
  try {
    const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const bugsRef = collection(db, "bugs");
    const q = query(
      bugsRef,
      where("updatedAt", ">=", Timestamp.fromDate(cutoffTime)),
      orderBy("updatedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching recently updated bugs:", error);
    return [];
  }
};

/**
 * Custom filter builder - Create complex filter logic
 * @param {Array} bugs - Bugs to filter
 * @param {Object} filterLogic - { AND: [...], OR: [...], NOT: [...] }
 * @returns {Array} Filtered bugs
 */
export const filterBugsComplex = (bugs, filterLogic) => {
  let result = [...bugs];

  // AND conditions (all must match)
  if (filterLogic.AND && Array.isArray(filterLogic.AND)) {
    filterLogic.AND.forEach((condition) => {
      result = result.filter((bug) => evaluateCondition(bug, condition));
    });
  }

  // OR conditions (at least one must match)
  if (filterLogic.OR && Array.isArray(filterLogic.OR)) {
    const orResult = result.filter((bug) =>
      filterLogic.OR.some((condition) => evaluateCondition(bug, condition))
    );
    result = orResult.length > 0 ? orResult : [];
  }

  // NOT conditions (none must match)
  if (filterLogic.NOT && Array.isArray(filterLogic.NOT)) {
    filterLogic.NOT.forEach((condition) => {
      result = result.filter((bug) => !evaluateCondition(bug, condition));
    });
  }

  return result;
};

/**
 * Helper to evaluate a single filter condition
 * @private
 */
const evaluateCondition = (bug, condition) => {
  const { field, operator, value } = condition;
  const bugValue = field.split(".").reduce((obj, key) => obj?.[key], bug);

  switch (operator) {
    case "==":
      return bugValue === value;
    case "!=":
      return bugValue !== value;
    case "contains":
      return String(bugValue).includes(value);
    case "in":
      return Array.isArray(value) && value.includes(bugValue);
    case ">":
      return bugValue > value;
    case "<":
      return bugValue < value;
    case ">=":
      return bugValue >= value;
    case "<=":
      return bugValue <= value;
    default:
      return false;
  }
};

export default {
  advancedSearch,
  saveFilter,
  getSavedFilters,
  getAssigneeWorkload,
  getHighPriorityBugs,
  getRecentlyUpdated,
  filterBugsComplex,
};
