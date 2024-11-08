'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isVerified: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  userCanvases: DocumentData[];
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [userCanvases, setUserCanvases] = useState<DocumentData[]>([]);

  useEffect(() => {
    let unsubscribeCanvases: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsVerified(user?.emailVerified ?? false);
      setLoading(false);

      if (unsubscribeCanvases) {
        unsubscribeCanvases();
      }

      if (user) {
        const q = query(
          collection(db, 'businessModelCanvases'),
          where('userId', '==', user.uid)
        );

        unsubscribeCanvases = onSnapshot(q, (snapshot) => {
          const canvases = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('canvases', canvases);
          setUserCanvases(canvases);
        });
      } else {
        setUserCanvases([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCanvases) {
        unsubscribeCanvases();
      }
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user, {
      url: window.location.origin,
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isVerified, 
      signUp, 
      signIn, 
      logout,
      userCanvases 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 