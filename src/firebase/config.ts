
// This file is the single source of truth for Firebase initialization.
// It is designed to be used in a client-side context.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, AppCheck } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

let services: FirebaseServices | null = null;
let appCheck: AppCheck | null = null;

/**
 * Initializes and gets the Firebase services. This function ensures that
 * Firebase is initialized only once.
 * @returns An object containing the initialized Firebase services.
 */
export function getFirebaseServices(): FirebaseServices {
  if (services) {
    return services;
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  // --- App Check Initialization ---
  if (typeof window !== 'undefined' && !appCheck) {
    // This is a special variable that Firebase's App Check SDK looks for.
    // It's set to true for development environments (like Firebase Studio)
    // to enable debugging without a valid reCAPTCHA token.
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NODE_ENV !== 'production';

    try {
        appCheck = initializeAppCheck(app, {
            // For production (Vercel), use reCAPTCHA Enterprise.
            // For development with the debug token set, this provider is effectively ignored.
            provider: new ReCaptchaEnterpriseProvider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
            isTokenAutoRefreshEnabled: true,
        });
        console.log("Firebase App Check initialized.");
    } catch (e) {
      console.warn("App Check initialization error:", e);
    }
  }


  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  services = { firebaseApp: app, auth, firestore, storage };
  
  return services;
}
