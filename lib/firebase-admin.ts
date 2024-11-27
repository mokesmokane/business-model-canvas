// firebaseAdmin.ts
import * as admin from 'firebase-admin';

try {
    console.log('Starting Firebase initialization...');

    console.log('Service account:', process.env.FIREBASE_SERVICE_ACCOUNT?.replace(/\\n/g, '\n'));
    // we have a bad charater at 187 of the service account so lets print out the characters from 170 to 200
    console.log('Service account characters 170 to 200:', process.env.FIREBASE_SERVICE_ACCOUNT?.replace(/\\n/g, '\n')?.substring(170, 200));
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT?.replace(/\\n/g, '\n') || '{}');

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
            // console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY);
            // console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
            // console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
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