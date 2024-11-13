import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUNFcFPoObBn87etmois_raTjxGf0lW3I",
  authDomain: "business-model-canvas-a9080.firebaseapp.com",
  projectId: "business-model-canvas-a9080",
  storageBucket: "business-model-canvas-a9080.firebasestorage.app",
  messagingSenderId: "1003896443693",
  appId: "1:1003896443693:web:9b66b2a807d2f1eedfb9a4",
  measurementId: "G-C0T3MZ5VXM"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics only on client side
// let analytics = null;
// if (typeof window !== 'undefined') {
//   // Dynamically import analytics
//   import('firebase/analytics').then((module) => {
//     analytics = module.getAnalytics(app);
//   });
// }

// export { analytics }; 