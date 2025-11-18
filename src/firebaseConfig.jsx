// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBdEVZgJDMSqc_RTIpmOB8j6hnaNPoDnhg",
  authDomain: "reacttask-83baf.firebaseapp.com",
  projectId: "reacttask-83baf",
  storageBucket: "reacttask-83baf.firebasestorage.app",
  messagingSenderId: "555681625549",
  appId: "1:555681625549:web:b816c0371a4b0366774084",
  measurementId: "G-CE902CXY99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app)