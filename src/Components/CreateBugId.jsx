import { db } from "../firebaseConfig";
import { doc, runTransaction } from "firebase/firestore";

export async function generateBugId() {
  const counterRef = doc(db, "counters", "bugCounter");

  try {
    const bugId = await runTransaction(db, async (tx) => {
      const counterSnap = await tx.get(counterRef);

      // If counter document doesn't exist → create it
      if (!counterSnap.exists()) {
        tx.set(counterRef, { count: 1 });
        return "BUG-00001";   // First bug ID
      }

      // If exists → increment
      let current = counterSnap.data().count;
      let next = current + 1;

      tx.update(counterRef, { count: next });

      return `BUG-${String(next).padStart(5, "0")}`;
    });

    return bugId;
  } catch (error) {
    console.error("Bug ID generation failed:", error);
    throw error;
  }
}
