import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Add comment to bug
export const addCommentToBug = async (bugId, comment) => {
  try {
    const commentsRef = collection(db, "bugs", bugId, "comments");
    const docRef = await addDoc(commentsRef, {
      ...comment,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...comment };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Get comments for bug
export const getCommentsByBug = async (bugId) => {
  try {
    const commentsRef = collection(db, "bugs", bugId, "comments");
    const snapshot = await getDocs(query(commentsRef));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

// Delete comment
export const deleteComment = async (bugId, commentId) => {
  try {
    const docRef = doc(db, "bugs", bugId, "comments", commentId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// Add activity log
export const addActivityLog = async (bugId, activity) => {
  try {
    const activityRef = collection(db, "bugs", bugId, "activity");
    const docRef = await addDoc(activityRef, {
      ...activity,
      timestamp: Timestamp.now(),
    });
    return { id: docRef.id, ...activity };
  } catch (error) {
    console.error("Error adding activity log:", error);
    throw error;
  }
};

// Get activity logs
export const getActivityLogs = async (bugId) => {
  try {
    const activityRef = collection(db, "bugs", bugId, "activity");
    const snapshot = await getDocs(query(activityRef));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error;
  }
};
