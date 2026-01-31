import { collection, query, where, getDocs, addDoc, Timestamp, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

// SLA Configuration - Map severity to max resolution time (in hours)
const SLA_CONFIG = {
  Critical: 4,
  High: 8,
  Medium: 24,
  Low: 72,
};

/**
 * Check if a bug is in SLA violation
 * @param {Object} bug - Bug object with createdAt timestamp
 * @param {string} bug.severity - Severity level
 * @param {Object} bug.status - Current status
 * @returns {Object} { isViolated: bool, hoursSinceDue: number, slaHours: number }
 */
export const checkSLAViolation = (bug) => {
  if (!bug || !bug.createdAt) {
    return { isViolated: false, hoursSinceDue: 0, slaHours: 0 };
  }

  const slaHours = SLA_CONFIG[bug.severity] || 24;
  const createdTime = bug.createdAt.toDate ? bug.createdAt.toDate() : new Date(bug.createdAt);
  const nowTime = new Date();
  const hoursPassed = (nowTime - createdTime) / (1000 * 60 * 60);

  const isViolated = hoursPassed > slaHours;
  const hoursSinceDue = Math.max(0, hoursPassed - slaHours);

  return { isViolated, hoursSinceDue, slaHours };
};

/**
 * Get SLA status for multiple bugs
 * @param {Array} bugs - Array of bug objects
 * @returns {Object} { violated: bugs[], atRisk: bugs[], healthy: bugs[] }
 */
export const getSLAStatus = (bugs) => {
  const violated = [];
  const atRisk = [];
  const healthy = [];

  bugs.forEach((bug) => {
    if (bug.status === "Closed" || bug.status === "Resolved") {
      return; // Skip closed bugs
    }

    const createdTime = bug.createdAt.toDate ? bug.createdAt.toDate() : new Date(bug.createdAt);
    const nowTime = new Date();
    const hoursPassed = (nowTime - createdTime) / (1000 * 60 * 60);
    const slaHours = SLA_CONFIG[bug.severity] || 24;
    const isViolated = hoursPassed > slaHours;
    const percentComplete = (hoursPassed / slaHours) * 100;

    const bugStatus = {
      ...bug,
      slaHours,
      isViolated,
      hoursSinceDue: Math.max(0, hoursPassed - slaHours),
      percentComplete: Math.min(100, percentComplete),
    };

    if (isViolated) {
      violated.push(bugStatus);
    } else if (percentComplete > 75) {
      // At risk if >75% of SLA time used
      atRisk.push(bugStatus);
    } else {
      healthy.push(bugStatus);
    }
  });

  return { violated, atRisk, healthy };
};

/**
 * Log time spent on a bug
 * @param {string} bugId - Bug ID
 * @param {Object} timeEntry - { userId, hours, description, date }
 * @returns {Promise<Object>} Created time entry
 */
export const logBugTime = async (bugId, timeEntry) => {
  try {
    const timeRef = collection(db, "bugs", bugId, "time_logs");
    const docRef = await addDoc(timeRef, {
      ...timeEntry,
      hours: parseFloat(timeEntry.hours) || 0,
      billable: timeEntry.billable !== false, // default true
      createdAt: Timestamp.now(),
      date: timeEntry.date || Timestamp.now(),
    });
    return { id: docRef.id, ...timeEntry };
  } catch (error) {
    console.error("Error logging time:", error);
    throw error;
  }
};

/**
 * Get time logs for a bug
 * @param {string} bugId - Bug ID
 * @returns {Promise<Array>} Time entries
 */
export const getTimeLogs = async (bugId) => {
  try {
    const timeRef = collection(db, "bugs", bugId, "time_logs");
    const snapshot = await getDocs(timeRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching time logs:", error);
    throw error;
  }
};

/**
 * Get total time spent on a bug
 * @param {string} bugId - Bug ID
 * @returns {Promise<Object>} { total: number, billable: number }
 */
export const getTotalBugTime = async (bugId) => {
  try {
    const logs = await getTimeLogs(bugId);
    const total = logs.reduce((acc, log) => acc + (log.hours || 0), 0);
    const billable = logs
      .filter((log) => log.billable !== false)
      .reduce((acc, log) => acc + (log.hours || 0), 0);
    return { total, billable };
  } catch (error) {
    console.error("Error calculating total time:", error);
    return { total: 0, billable: 0 };
  }
};

/**
 * Subscribe to time logs in real-time
 * @param {string} bugId - Bug ID
 * @param {Function} callback - Called with updated time logs
 * @returns {Function} Unsubscribe function
 */
export const subscribeToTimeLogs = (bugId, callback) => {
  try {
    const timeRef = collection(db, "bugs", bugId, "time_logs");
    return onSnapshot(timeRef, (snapshot) => {
      const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(logs);
    });
  } catch (error) {
    console.error("Error subscribing to time logs:", error);
    throw error;
  }
};

/**
 * Get billable hours report for a team member
 * @param {string} userId - User ID
 * @param {Date} from - Start date
 * @param {Date} to - End date
 * @returns {Promise<Object>} { total: number, byBug: { bugId: hours, ... } }
 */
export const getBillableHoursReport = async (userId, from, to) => {
  try {
    const bugsRef = collection(db, "bugs");
    const bugsSnapshot = await getDocs(bugsRef);

    let totalHours = 0;
    const byBug = {};

    for (const bugDoc of bugsSnapshot.docs) {
      const timeRef = collection(db, "bugs", bugDoc.id, "time_logs");
      const timeQuery = query(
        timeRef,
        where("userId", "==", userId),
        where("billable", "==", true)
      );
      const timeSnapshot = await getDocs(timeQuery);

      let bugTotal = 0;
      timeSnapshot.docs.forEach((timeDoc) => {
        const data = timeDoc.data();
        const logDate = data.date.toDate ? data.date.toDate() : new Date(data.date);
        if (logDate >= from && logDate <= to) {
          bugTotal += data.hours || 0;
        }
      });

      if (bugTotal > 0) {
        byBug[bugDoc.id] = bugTotal;
        totalHours += bugTotal;
      }
    }

    return { total: totalHours, byBug };
  } catch (error) {
    console.error("Error generating billable hours report:", error);
    return { total: 0, byBug: {} };
  }
};

export default {
  checkSLAViolation,
  getSLAStatus,
  logBugTime,
  getTimeLogs,
  getTotalBugTime,
  subscribeToTimeLogs,
  getBillableHoursReport,
};
