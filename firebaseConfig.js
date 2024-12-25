import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiMCITqPDyf0L806GiH3XkNVVlxNQu3lQ",
  authDomain: "artgenix-8b25c.firebaseapp.com",
  projectId: "artgenix-8b25c",
  storageBucket: "artgenix-8b25c.firebasestorage.app",
  messagingSenderId: "180156671021",
  appId: "1:180156671021:web:9b4d1ebe88e774399e04a4",
  measurementId: "G-Q7ZTMZ1YCG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;