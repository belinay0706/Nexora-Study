import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjrlxdSRMefNAOhc8WHWAN9C1wl3eKy7g",
  authDomain: "belora-study.firebaseapp.com",
  projectId: "belora-study",
  storageBucket: "belora-study.firebasestorage.app",
  messagingSenderId: "522623674606",
  appId: "1:522623674606:web:82a81feb4266672cadabff"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const db = getFirestore(app);

export default app;