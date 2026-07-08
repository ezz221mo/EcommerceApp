import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase/firebase';

export const registerUser = async (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return signOut(auth);
};
