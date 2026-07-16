import { createContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { loginUser, registerUser, logoutUser } from '../services/authService';
import {
  getUserDocument,
  createUserDocument,
  updateUserDocument,
} from '../services/userService';
import { loadCart, clearCartSession } from '../store';

export const AuthContext = createContext(null);

const STORE_OWNER_EMAIL = 'ezzaldin@gmail.com';
const OLD_PRIVILEGED_ROLES = ['admin', 'seller'];

async function loadAndMigrateUser(uid, email) {
  let data = await getUserDocument(uid);
  if (!data) {
    if (email === STORE_OWNER_EMAIL) {
      await createUserDocument(uid, 'Store Owner', email);
      data = await getUserDocument(uid);
      if (data) {
        await updateUserDocument(uid, { role: 'store_owner' });
        data = await getUserDocument(uid);
      }
    }
    return data;
  }
  if (OLD_PRIVILEGED_ROLES.includes(data.role)) {
    const updated = await updateUserDocument(uid, { role: 'store_owner' });
    return updated;
  }
  if (email === STORE_OWNER_EMAIL && data.role !== 'store_owner') {
    const updated = await updateUserDocument(uid, { role: 'store_owner' });
    return updated;
  }
  return data;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        loadCart(firebaseUser.uid);
        try {
          const data = await loadAndMigrateUser(firebaseUser.uid, firebaseUser.email);
          setUserData(data);
        } catch {
          setUserData(null);
        }
      } else {
        clearCartSession();
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await loginUser(email, password);
    const data = await loadAndMigrateUser(result.user.uid, result.user.email);
    loadCart(result.user.uid);
    setUserData(data);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const result = await registerUser(email, password);
    const userDataObj = {
      uid: result.user.uid,
      name,
      email,
      role: 'customer',
      photoURL: null,
    };
    await createUserDocument(result.user.uid, name, email);
    const docSnap = await getUserDocument(result.user.uid);
    const data = docSnap || userDataObj;
    setUserData(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    clearCartSession();
    setCurrentUser(null);
    setUserData(null);
  }, []);

  const refreshUserData = useCallback(async () => {
    if (!currentUser) return null;
    const data = await getUserDocument(currentUser.uid);
    setUserData(data);
    return data;
  }, [currentUser]);

  const isStoreOwner = userData?.role === 'store_owner' || userData?.role === 'admin' || userData?.role === 'seller';

  const value = {
    currentUser,
    userData,
    role: userData?.role || null,
    isStoreOwner,
    loading,
    login,
    register,
    logout,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}