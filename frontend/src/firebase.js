// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAhh1Z4okTMlBnll_qVf8tijV8Z5DiS4lw",
  authDomain: "aivle-team0721.firebaseapp.com",
  databaseURL: "https://aivle-team0721-default-rtdb.firebaseio.com",
  projectId: "aivle-team0721",
  storageBucket: "aivle-team0721.firebasestorage.app",
  messagingSenderId: "902267887946",
  appId: "1:902267887946:web:22e6c9a70fea861955e1b3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();