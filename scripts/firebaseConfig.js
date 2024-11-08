// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0-pOe8CP2urkfs3yYHlyV2O0mf7qh0lA",
  authDomain: "sigalacifra.firebaseapp.com",
  projectId: "sigalacifra",
  storageBucket: "sigalacifra.firebasestorage.app",
  messagingSenderId: "730161521193",
  appId: "1:730161521193:web:a2e18ead178f8ddba53238",
  measurementId: "G-BY583J4Q4E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };