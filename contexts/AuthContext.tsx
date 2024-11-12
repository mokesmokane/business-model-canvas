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
import { collection, query, where, onSnapshot, DocumentData, doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;
  isVerified: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  userCanvases: DocumentData[];
  subscriptionStatus: 'free' | 'pro' | 'enterprise' | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [userCanvases, setUserCanvases] = useState<DocumentData[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'free' | 'pro' | 'enterprise' | null>(null);

  useEffect(() => {
    let unsubscribeCanvases: (() => void) | undefined;
    let unsubscribeSubscription: (() => void) | undefined;
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsVerified(user?.emailVerified ?? false);
      setLoading(false);

      if (unsubscribeCanvases) {
        unsubscribeCanvases();
      }
      if (unsubscribeSubscription) {
        unsubscribeSubscription();
      }
      if (unsubscribeUser) {
        unsubscribeUser();
      }

      if (user) {
        const canvasesQuery = query(
          collection(db, 'businessModelCanvases'),
          where('userId', '==', user.uid)
        );

        unsubscribeCanvases = onSnapshot(canvasesQuery, (snapshot) => {
          const canvases = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setUserCanvases(canvases);
        });

        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeSubscription = onSnapshot(userDocRef, (snapshot) => {
          const userData = snapshot.data();
          setUserData(userData || null);
          const status = determineSubscriptionStatus(userData);
          setSubscriptionStatus(status);
        });

        unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
          const userData = snapshot.data();
          setUserData(userData || null);
          const status = determineSubscriptionStatus(userData);
          setSubscriptionStatus(status);
        });
      } else {
        
        setUserCanvases([]);
        setSubscriptionStatus(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeCanvases) {
        unsubscribeCanvases();
      }
      if (unsubscribeSubscription) {
        unsubscribeSubscription();
      }
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      createdAt: new Date(),
      subscriptionStatus: 'free'
    });
    await sendEmailVerification(userCredential.user, {
      url: window.location.origin,
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    //clear out all data
    setUser(null);
    setUserData(null);
    setUserCanvases([]);
    setSubscriptionStatus(null);
    await signOut(auth);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      isVerified, 
      signUp, 
      signIn, 
      logout,
      userCanvases,
      subscriptionStatus
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 

const determineSubscriptionStatus = (userData: any): 'free' | 'pro' | 'enterprise' | null => {
  if (!userData) return null;
  
  const isActive = userData.subscriptionStatus === 'active';
  const periodNotExpired = new Date(userData.subscriptionPeriodEnd).getTime() > new Date().getTime();
  
  if (!isActive || !periodNotExpired) {
    return 'free';
  }

  switch (userData.subscriptionPlan) {
    case 'pro':
      return 'pro';
    case 'enterprise':
      return 'enterprise';
    default:
      return 'free';
  }
};