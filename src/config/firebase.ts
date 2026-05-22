import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/** Web app config — https://console.firebase.google.com */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'AIzaSyCRBde4Mi8ymxd6NpNaFYcytGjab7gj0sw',
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'acadex-6203f.firebaseapp.com',
  databaseURL:
    process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ??
    'https://acadex-6203f-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'acadex-6203f',
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'acadex-6203f.firebasestorage.app',
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '891701525126',
  appId:
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '1:891701525126:web:7d10044ff60a6be124af07',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-6EPXXCYBQS',
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();

/** Firebase Authentication */
export const auth: Auth = getAuth(app);

/** Firestore — primary database (do not use Firebase Storage; use Supabase) */
export const db: Firestore = getFirestore(app);

export { app };
