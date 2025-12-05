// This file is the single source of truth for Firebase initialization.
// It is designed to be used in a client-side context.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';

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
  if (typeof window !== 'undefined') {
    // We only want to initialize App Check in the production environment.
    // In development, App Check can cause issues, especially within iframes like in Firebase Studio.
    if (process.env.NODE_ENV === 'production') {
      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaEnterpriseProvider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
          isTokenAutoRefreshEnabled: true,
        });
      } catch (e) {
        console.warn("App Check initialization error:", e);
      }
    } else {
        // In development, we can set up a debug token if needed, but for simplicity
        // and to avoid iframe issues, we can skip initialization altogether.
        // If you need to test App Check locally, uncomment the following line and
        // add the generated token to your Firebase project settings.
        // (window as any).self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        console.log("App Check is disabled in development environment.");
    }
  }

  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  services = { firebaseApp: app, auth, firestore, storage };
  
  return services;
}
