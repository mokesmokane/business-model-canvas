// firebaseAdmin.ts
import * as admin from 'firebase-admin';

try {
    console.log('Starting Firebase initialization...');
    console.log('FIREBASE_SERVICE_ACCOUNT:', process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

    console.log('Service account parsed:', {
        hasProjectId: !!serviceAccount.project_id,
        hasClientEmail: !!serviceAccount.client_email,
        hasPrivateKey: !!serviceAccount.private_key,
    });

    if (!admin.apps.length) {   
        if (Object.keys(serviceAccount).length > 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase initialized with service account');
        } else {
            console.log('No service account found, falling back to individual credentials');
            console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY);
            console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
            console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
            admin.initializeApp({
                credential: admin.credential.cert({
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    projectId: process.env.FIREBASE_PROJECT_ID,
                }),
            });
        }
    }

    // Test the connection
    const db = admin.firestore();
    console.log('Firestore instance created successfully');
} catch (error) {
    console.error('Firebase error:', error);
    throw error;
}

const db = admin.firestore();
export { admin, db };