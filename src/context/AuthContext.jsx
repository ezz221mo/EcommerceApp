import { createContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { loginUser, registerUser, logoutUser } from '../services/authService';
import {
  getUserDocument,
  createUserDocument,
  updateUserDocument,
} from '../services/userService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        try {
          const data = await getUserDocument(firebaseUser.uid);
          setUserData(data);
        } catch {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await loginUser(email, password);
    const data = await getUserDocument(result.user.uid);
    setUserData(data);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const result = await registerUser(email, password);
    const userDataObj = {
      uid: result.user.uid,
      name,
      email,
      role: 'buyer',
      photoURL: null,
      sellerSince: null,
    };
    await createUserDocument(result.user.uid, name, email);
    const docSnap = await getUserDocument(result.user.uid);
    const data = docSnap || userDataObj;
    setUserData(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserData(null);
  }, []);

  const becomeSeller = useCallback(async () => {
    if (!currentUser) return;
    const updated = await updateUserDocument(currentUser.uid, {
      role: 'seller',
      sellerSince: new Date().toISOString(),
    });
    setUserData(updated);
  }, [currentUser]);

  const refreshUserData = useCallback(async () => {
    if (!currentUser) return null;
    const data = await getUserDocument(currentUser.uid);
    setUserData(data);
    return data;
  }, [currentUser]);

  const value = {
    currentUser,
    userData,
    role: userData?.role || null,
    loading,
    login,
    register,
    logout,
    becomeSeller,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}