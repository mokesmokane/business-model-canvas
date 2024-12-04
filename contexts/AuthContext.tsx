'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData, doc, addDoc, setDoc, getDoc } from 'firebase/firestore';
import { useCanvas } from './CanvasContext';
import { canvasService } from '@/services/canvasService';
import { aiAgentService } from '@/services/aiAgentService';

interface AuthContextType {
  user: User | null;
  userData: DocumentData | null;
  loading: boolean;
  isVerified: boolean;
  isInTrialPeriod: boolean;
  isAdminUser: boolean;
  trialDaysRemaining: number | null;
  hasProFeatures: boolean;
  signUp: (email: string, password: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isInTrialPeriod, setIsInTrialPeriod] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [hasProFeatures, setHasProFeatures] = useState(false);
  
  useEffect(() => {
    let unsubscribeUser: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsVerified(user?.emailVerified ?? false);
      setLoading(false);

      if (unsubscribeUser) {
        unsubscribeUser();
      }

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);

        // Check if user document exists
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // Create initial user document if it doesn't exist
          await setDoc(userDocRef, {
            email: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            subscriptionStatus: 'free',
            subscriptionPlan: 'free'
          });
        }

        aiAgentService.initialize(user.uid);
        canvasService.initialize(user.uid);

        unsubscribeUser = onSnapshot(userDocRef, (snapshot) => {
          const userData = snapshot.data();
          setUserData(userData || null);
          
          // Calculate trial period
          if (userData?.createdAt) {
            const createdAt = new Date(userData.createdAt);
            
            const trialEndDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
            const now = new Date();
            const isInTrialPeriod = now < trialEndDate;
            setIsInTrialPeriod(isInTrialPeriod);
            setIsAdminUser(userData.admin);
            
            const remainingTime = trialEndDate.getTime() - now.getTime();
            const remainingDays = Math.max(0, Math.ceil(remainingTime / (1000 * 60 * 60 * 24)));
            setTrialDaysRemaining(remainingDays);
            setHasProFeatures(userData?.subscriptionStatus === 'active' && userData?.subscriptionPlan === 'pro' || isInTrialPeriod);
          }
        });
      } else {
        setUserData(null);
        setIsInTrialPeriod(false);
        setTrialDaysRemaining(null);
        setHasProFeatures(false);
      }
    });

    return () => {
      if (unsubscribeUser) {
        unsubscribeUser();
      }
      unsubscribeAuth();
    };
  }, []);

  const signUp = async (email: string, password: string): Promise<User> => {
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subscriptionStatus: 'active',
        subscriptionPlan: 'free'
      });
      
      try {
        const actionCodeSettings = {
          url: `${window.location.origin}/verify-email`,
          handleCodeInApp: true,
        };
        
        await sendEmailVerification(userCredential.user, actionCodeSettings);
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

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      isVerified, 
      isInTrialPeriod,
      trialDaysRemaining,
      isAdminUser,
      hasProFeatures,
      signUp, 
      signIn, 
      logout,
      resendVerificationEmail,
      sendVerificationEmail,
      resetPassword,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 