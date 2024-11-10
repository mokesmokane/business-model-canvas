'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function SuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { user } = useAuth()

  useEffect(() => {
    const verifySubscription = async () => {
      if (sessionId && user) {
        try {
          const response = await fetch('/api/stripe/verify-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });

          const { customerId, subscriptionId, plan, status, currentPeriodEnd } = await response.json();

          console.log('API Response:', { customerId, subscriptionId, plan, status, currentPeriodEnd });
          await setDoc(doc(db, 'users', user.uid), {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionPlan: plan,
            subscriptionStatus: status,
            subscriptionPeriodEnd: currentPeriodEnd,
            lastUpdated: new Date().toISOString()
          }, { merge: true });
          
          setTimeout(() => {
            router.push('/')
          }, 3000)
        } catch (error) {
          console.error('Error updating subscription:', error);
        }
      }
    };

    verifySubscription();
  }, [sessionId, user, router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Thank you for your purchase!</h1>
        <p className="text-gray-400">You will be redirected shortly...</p>
      </div>
    </div>
  )
} 