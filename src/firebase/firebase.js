import { initializeApp } from "firebase/app";
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

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
