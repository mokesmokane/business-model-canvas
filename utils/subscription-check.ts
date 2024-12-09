import { admin } from '@/lib/firebase-admin';

export async function verifySubscriptionStatus(authHeader: string) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized - No valid auth token');
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    if (!uid) {
      throw new Error('Unauthorized - User not logged in');
    }

    // Get user data from Firestore
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(uid)
      .get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    
    // Check trial period
    const createdAt = new Date(userData?.createdAt);
    const trialEndDate = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const now = new Date();
    const isInTrialPeriod = now < trialEndDate;
    
    // Check subscription status
    const isSubscribed = userData?.subscriptionStatus === 'active' && userData?.subscriptionPlan === 'pro';

    if (!isInTrialPeriod && !isSubscribed) {
        return false
    }

    return true;
  } catch (error) {
    console.error('Auth error:', error);
    if (error instanceof Error) {
      throw error; // Preserve the original error message
    }
    throw new Error('Unauthorized - Invalid token');
  }
} 