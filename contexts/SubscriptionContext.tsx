'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { useAuth } from './AuthContext';

type SubscriptionStatus = 'free' | 'pro' | 'enterprise' | null;

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus;
  subscriptionData: DocumentData | null;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptionStatus: null,
  subscriptionData: null,
  isLoading: true,
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null);
  const [subscriptionData, setSubscriptionData] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        const userData = snapshot.data();
        setSubscriptionData(userData || null);
        
        // Determine subscription status
        if (!userData) {
          setSubscriptionStatus(null);
        } else {
          const isActive = userData.subscriptionStatus === 'active';
          const periodNotExpired = new Date(userData.subscriptionPeriodEnd).getTime() > new Date().getTime();
          
          if (!isActive || !periodNotExpired) {
            setSubscriptionStatus('free');
          } else {
            switch (userData.subscriptionPlan) {
              case 'pro':
                setSubscriptionStatus('pro');
                break;
              case 'enterprise':
                setSubscriptionStatus('enterprise');
                break;
              default:
                setSubscriptionStatus('free');
            }
          }
        }
        setIsLoading(false);
      });
    } else {
      setSubscriptionStatus(null);
      setSubscriptionData(null);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  return (
    <SubscriptionContext.Provider value={{ 
      subscriptionStatus, 
      subscriptionData,
      isLoading 
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext); 