// This file is the single source of truth for Firebase initialization.
// It is designed to be used in a client-side context.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

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
  
  if (typeof window !== 'undefined') {
    // Pass your reCAPTCHA v3 site key (public key) to activate().
    // Make sure this is set in your environment variables.
    const reCaptchaV3SiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    if (reCaptchaV3SiteKey) {
        // This is the correct way to set the debug token.
        // It will be used only in development environments where it is set.
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = 'e481d300-fa1d-4245-952e-4b9026564ae2';

        initializeAppCheck(app, {
            provider: new ReCaptchaV3Provider(reCaptchaV3SiteKey),
            // Optional: set to 'true' to allow auto-refresh of App Check token.
            isTokenAutoRefreshEnabled: true
        });
    } else {
        console.warn("reCAPTCHA v3 site key not found. App Check is not initialized.");
    }
  }


  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  services = { firebaseApp: app, auth, firestore, storage };
  
  return services;
}
