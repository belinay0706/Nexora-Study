import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASlvxUb4pwoI-3BE0ypMangTAKPKAitd4",
  authDomain: "nexora-study-c648f.firebaseapp.com",
  projectId: "nexora-study-c648f",
  storageBucket: "nexora-study-c648f.firebasestorage.app",
  messagingSenderId: "318582369289",
  appId: "1:318582369289:web:27099a540e7c3639ccdcd8",
  measurementId: "G-EH3XP810D0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

export default app;