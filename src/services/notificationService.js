import { collection, addDoc, Timestamp, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";

// Send an in-app notification to a user (stored under top-level "notifications" with userId)
export const sendUserNotification = async (userId, payload) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const docRef = await addDoc(notificationsRef, {
      userId,
      title: payload.title || "Notification",
      body: payload.body || "You have a new notification",
      bugId: payload.bugId || null,
      read: false,
      type: payload.type || 'info',
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...payload };
  } catch (error) {
    console.error("Error sending notification:", error);
    // Don't throw - allow app to continue
    return null;
  }
};

// Subscribe to notifications for a specific user
export const subscribeToNotifications = (userId, callback) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const notes = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          callback(notes);
        } catch (error) {
          console.error('Error processing notifications snapshot:', error);
          callback([]);
        }
      },
      (error) => {
        // Handle permission errors and other firestore errors gracefully
        if (error.code === 'permission-denied') {
          console.warn('Permission denied for notifications. User may not have access.', error);
        } else {
          console.error('Error subscribing to notifications:', error);
        }
        // Call callback with empty array to prevent app crash
        callback([]);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up notification subscription:', error);
    // Return a no-op function if subscription setup fails
    return () => {};
  }
};

// Convenience alias used by workflow service
export const sendUserNotificationQuiet = async (userId, payload) => {
  try {
    return await sendUserNotification(userId, payload);
  } catch (e) {
    // swallow errors for background notifications
    console.error('Notification failed (quiet):', e);
    return null;
  }
};

export default sendUserNotification;
