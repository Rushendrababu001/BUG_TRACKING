import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { evaluateWorkflows } from "./workflowService";
import { sendUserNotification } from "./notificationService";
import { addActivityLog } from "./commentService";

// Get all bugs with optional filters
export const getBugs = async (filters = {}) => {
  try {
    const conditions = [];
    const bugsRef = collection(db, "bugs");

    if (filters.userId) {
      conditions.push(where("createdBy", "==", filters.userId));
    }
    if (filters.status) {
      conditions.push(where("status", "==", filters.status));
    }
    if (filters.severity) {
      conditions.push(where("severity", "==", filters.severity));
    }
    if (filters.assignee) {
      conditions.push(where("assignedTo", "==", filters.assignee));
    }

    const q = query(
      bugsRef,
      ...conditions,
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching bugs:", error);
    throw error;
  }
};

// Subscribe to real-time bug updates
export const subscribeToBugs = (callback, filters = {}) => {
  try {
    const conditions = [];
    const bugsRef = collection(db, "bugs");

    if (filters.userId) {
      conditions.push(where("createdBy", "==", filters.userId));
    }
    if (filters.status) {
      conditions.push(where("status", "==", filters.status));
    }

    const q = query(
      bugsRef,
      ...conditions,
      orderBy("createdAt", "desc")
    );

    return onSnapshot(
      q,
      (snapshot) => {
        try {
          const bugs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          callback(bugs);
        } catch (error) {
          console.error('Error processing bugs snapshot:', error);
          callback([]);
        }
      },
      (error) => {
        // Handle permission errors and other firestore errors gracefully
        if (error.code === 'permission-denied') {
          console.warn('Permission denied for bugs. User may not have access.', error);
        } else {
          console.error('Error subscribing to bugs:', error);
        }
        // Call callback with empty array to prevent app crash
        callback([]);
      }
    );
  } catch (error) {
    console.error("Error setting up bug subscription:", error);
    // Return a no-op function if subscription setup fails
    return () => {};
  }
};

// Get single bug
export const getBugById = async (bugId) => {
  try {
    const docRef = doc(db, "bugs", bugId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  } catch (error) {
    console.error("Error fetching bug:", error);
    throw error;
  }
};

// Create bug
export const createBug = async (bugData) => {
  try {
    const bugsRef = collection(db, "bugs");
    const docRef = await addDoc(bugsRef, {
      ...bugData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: bugData.status || "Open",
      severity: bugData.severity || "Medium",
      comments: [],
      watchers: bugData.watchers || [],
      tags: bugData.tags || [],
    });
    // fetch the full saved document
    const snapshot = await getDoc(docRef);
    const created = { id: snapshot.id, ...snapshot.data() };

    // add activity log
    await addActivityLog(created.id, { type: 'create', message: `Bug created: ${created.title || created.id}`, by: created.createdBy || 'unknown' });

    // run workflows for create event
    try {
      await evaluateWorkflows(created, 'create');
    } catch (e) {
      console.error('Workflow evaluation failed on create:', e);
    }

    // notify watchers (simple implementation)
    const watchers = Array.isArray(created.watchers) ? created.watchers : [];
    for (const w of watchers) {
      try {
        await sendUserNotification(w, {
          title: 'New bug assigned or watched',
          body: `A bug (${created.title || created.id}) was created.`,
          bugId: created.id,
        });
      } catch (err) {
        console.error('Failed to send watcher notification', err);
      }
    }

    return created;
  } catch (error) {
    console.error("Error creating bug:", error);
    throw error;
  }
};

// Update bug
export const updateBug = async (bugId, updates) => {
  try {
    const docRef = doc(db, "bugs", bugId);
    // fetch previous state
    const beforeSnap = await getDoc(docRef);
    const before = beforeSnap.exists() ? { id: beforeSnap.id, ...beforeSnap.data() } : null;

    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

    const afterSnap = await getDoc(docRef);
    const after = afterSnap.exists() ? { id: afterSnap.id, ...afterSnap.data() } : null;

    // add activity log entry
    await addActivityLog(bugId, { type: 'update', message: `Bug updated`, by: updates.updatedBy || 'unknown', details: updates });

    // if status changed, evaluate workflows for status change
    try {
      if (before && after && before.status !== after.status) {
        await evaluateWorkflows(after, 'status_changed');
      } else {
        await evaluateWorkflows(after, 'update');
      }
    } catch (e) {
      console.error('Workflow evaluation failed on update:', e);
    }

    // notify watchers about update
    const watchers = Array.isArray(after.watchers) ? after.watchers : [];
    for (const w of watchers) {
      try {
        await sendUserNotification(w, {
          title: 'Bug updated',
          body: `Bug (${after.title || after.id}) was updated.`,
          bugId: after.id,
        });
      } catch (err) {
        console.error('Failed to send watcher notification', err);
      }
    }

    return after;
  } catch (error) {
    console.error("Error updating bug:", error);
    throw error;
  }
};

// Delete bug
export const deleteBug = async (bugId) => {
  try {
    await deleteDoc(doc(db, "bugs", bugId));
    return true;
  } catch (error) {
    console.error("Error deleting bug:", error);
    throw error;
  }
};

// Bulk operations
export const bulkUpdateBugs = async (bugIds, updates) => {
  try {
    const promises = bugIds.map((id) => updateBug(id, updates));
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error bulk updating bugs:", error);
    throw error;
  }
};

export const bulkDeleteBugs = async (bugIds) => {
  try {
    const promises = bugIds.map((id) => deleteBug(id));
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error("Error bulk deleting bugs:", error);
    throw error;
  }
};
