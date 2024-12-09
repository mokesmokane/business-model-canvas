'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { useAuth } from './AuthContext';

type SubscriptionStatus = 'free' | 'pro' | 'enterprise' | null;

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus;
  subscriptionPeriodEnd: Date | null;
  subscriptionData: DocumentData | null;
  isLoading: boolean;
  hasAccessToProFeatures: boolean;
  isFreeUser: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptionStatus: null,
  subscriptionPeriodEnd: null,
  subscriptionData: null,
  isLoading: true,
  hasAccessToProFeatures: false,
  isFreeUser: false,
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null);
  const [subscriptionPeriodEnd, setSubscriptionPeriodEnd] = useState<Date | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccessToProFeatures, setHasAccessToProFeatures] = useState(false);
  const [isFreeUser, setIsFreeUser] = useState(false);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        const userData = snapshot.data();
        
        setSubscriptionData(userData || null);
        
        if (!userData) {
          setSubscriptionStatus(null);
          setHasAccessToProFeatures(false);
        } else {
          const isActive = userData.subscriptionStatus === 'active';
          const periodNotExpired = new Date(userData.subscriptionPeriodEnd).getTime() > new Date().getTime();
          setSubscriptionPeriodEnd(new Date(userData.subscriptionPeriodEnd));

          // Calculate trial period
          const createdAt = new Date(userData.createdAt);
          const trialEndDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
          const isInTrialPeriod = new Date() < trialEndDate;
          console.log('isInTrialPeriod', isInTrialPeriod);
          if (!isActive || !periodNotExpired) {
            setIsFreeUser(true);
            console.log('isActive', isActive);
            console.log('periodNotExpired', periodNotExpired);
            setSubscriptionStatus('free');
            setHasAccessToProFeatures(isInTrialPeriod);
          } else {
            setIsFreeUser(false);
            console.log('userData.subscriptionPlan', userData.subscriptionPlan);
            switch (userData.subscriptionPlan) {
              case 'pro':
                setSubscriptionStatus('pro');
                setHasAccessToProFeatures(true);
                break;
              case 'enterprise':
                setSubscriptionStatus('enterprise');
                setHasAccessToProFeatures(true);
                break;
              default:
                setIsFreeUser(true);
                setSubscriptionStatus('free');
                setHasAccessToProFeatures(isInTrialPeriod);
            }
          }
        }
        setIsLoading(false);
      });
    } else {
      setSubscriptionStatus(null);
      setSubscriptionData(null);
      setIsFreeUser(true);
      setHasAccessToProFeatures(false);
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
      subscriptionPeriodEnd,
      subscriptionData,
      isLoading,
      hasAccessToProFeatures,
      isFreeUser
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext); 