// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKcBqv38qCPAKJUx4lv0TUU8Rolb3UIdI",
  authDomain: "prepwise-b44ea.firebaseapp.com",
  projectId: "prepwise-b44ea",
  storageBucket: "prepwise-b44ea.firebasestorage.app",
  messagingSenderId: "497479233676",
  appId: "1:497479233676:web:ffaee35c42204402174ba9",
  measurementId: "G-9VLW84V6D2"
};

// Initialize Firebase
const app = !getApps().length? initializeApp(firebaseConfig): getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);