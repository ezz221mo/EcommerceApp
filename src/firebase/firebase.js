import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCu0JmaA__lHr4DLmBYs5vLUYrsTukrgJs",
  authDomain: "ecommerceapp-fc7c9.firebaseapp.com",
  projectId: "ecommerceapp-fc7c9",
  storageBucket: "ecommerceapp-fc7c9.firebasestorage.app",
  messagingSenderId: "770501969491",
  appId: "1:770501969491:web:0b5a0bbc91f75cfcfd28a6"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// Secondary app instance for admin operations
let adminApp;
if (!getApps().some(a => a.name === 'admin')) {
  adminApp = initializeApp(firebaseConfig, 'admin');
} else {
  adminApp = getApps().find(a => a.name === 'admin');
}
export const adminAuth = getAuth(adminApp);

export default app;
