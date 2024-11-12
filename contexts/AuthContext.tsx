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
import { collection, query, where, onSnapshot, DocumentData, doc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;
  isVerified: boolean;
  signUp: (email: string, password: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
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
    console.log('Auth State:', {
      loading,
      user: user?.email,
      isVerified: user?.emailVerified,
      userData
    });
  }, [loading, user, userData]);

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

  const signUp = async (email: string, password: string): Promise<User> => {
    console.log('Starting signup process for:', email);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created successfully:', userCredential.user.uid);
      
      try {
        console.log('Attempting to send verification email...');
        const actionCodeSettings = {
          url: `${window.location.origin}/verify-email`,
          handleCodeInApp: true,
        };
        
        await sendEmailVerification(userCredential.user, actionCodeSettings);
        console.log('Verification email sent successfully');
        console.log('Email verified status:', userCredential.user.emailVerified);
        console.log('User email:', userCredential.user.email);
        
        // await signOut(auth);
        window.location.href = '/verify-email';
        return userCredential.user;
        
      } catch (verificationError) {
        console.error('Error sending verification email:', verificationError);
        if (verificationError instanceof Error) {
          console.error('Error name:', verificationError.name);
          console.error('Error message:', verificationError.message);
          console.error('Error stack:', verificationError.stack);
        }
        await signOut(auth);
        throw verificationError;
      }
    } catch (signupError) {
      console.error('Error during signup:', signupError);
      throw signupError;
    }
  };

  const signIn = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      throw new Error('Please verify your email before signing in');
    }
    return userCredential.user;
  };

  const resendVerificationEmail = async () => {
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    await sendEmailVerification(user, {
      url: `${window.location.origin}/verify-email`,
    });
  };

  const logout = async () => {
    //clear out all data
    setUser(null);
    setUserData(null);
    setUserCanvases([]);
    setSubscriptionStatus(null);
    setIsVerified(false);
    await signOut(auth);
    window.location.href = '/';
  };

  const sendVerificationEmail = async () => {
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    await sendEmailVerification(user, {
      url: `${window.location.origin}/verify-email`,
    });
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
      resendVerificationEmail,
      sendVerificationEmail,
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