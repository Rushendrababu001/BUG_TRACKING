import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Subscribe to user profile
export const subscribeToUserProfile = (userId, callback) => {
  try {
    const docRef = doc(db, "users", userId);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() });
      }
    });
  } catch (error) {
    console.error("Error subscribing to user profile:", error);
    throw error;
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, updates) => {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Get team members by role
export const getTeamMembersByRole = async (role) => {
  try {
    const q = query(collection(db, "users"), where("role", "==", role));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
};
