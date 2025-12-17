// Firebase Configuration for DEVELOPMENT environment
// This file is used during refactoring work on the structured-data branch

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCNebk6nybVyg9Jiu0PJsFh7IuW10Wbxk4",
  authDomain: "sigalacifra-dev.firebaseapp.com",
  projectId: "sigalacifra-dev",
  storageBucket: "sigalacifra-dev.firebasestorage.app",
  messagingSenderId: "83789259500",
  appId: "1:83789259500:web:88a0f22908e0a024ea7bc9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
