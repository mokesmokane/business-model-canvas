// firebaseAdmin.ts
import * as admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
if (!admin.apps.length) {   
    //if serviceAccount is not empty, use it to initialize the app
    if (Object.keys(serviceAccount).length > 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        } else {
        admin.initializeApp({
            credential: admin.credential.cert({
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                projectId: process.env.FIREBASE_PROJECT_ID,
            }),
        });
    }
}

const db = admin.firestore();

export { admin, db };