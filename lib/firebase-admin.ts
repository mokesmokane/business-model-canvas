// firebaseAdmin.ts
import * as admin from 'firebase-admin';

try {
    console.log('Starting Firebase initialization...');
    const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT || '';
    
    if (serviceAccountEnv) {
        const serviceAccountJSON = Buffer.from(serviceAccountEnv, 'base64').toString('utf8');
        console.log('Service account JSON:', serviceAccountJSON);
        const serviceAccount = JSON.parse(serviceAccountJSON);

        console.log('Service account parsed:', {
            hasProjectId: !!serviceAccount.project_id,
            hasClientEmail: !!serviceAccount.client_email,
            hasPrivateKey: !!serviceAccount.private_key,
        });

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase initialized with service account');
        }
    } else {
        console.log('No service account found, falling back to individual credentials');
        if (!admin.apps.length) {
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