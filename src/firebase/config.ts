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

  // Initialize App Check
  if (typeof window !== 'undefined') {
    // Pass the reCAPTCHA Enterprise site key.
    // Use hardcoded key for local dev confidence, fallback to env var
    const reCaptchaKey = "6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS";

    // Assign the debug token to a variable.
    if (process.env.NODE_ENV !== 'production') {
      (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = "e481d300-fa1d-4245-952e-4b9026564ae2";
    }

    if (reCaptchaKey) {
<<<<<<< HEAD
        try {
            initializeAppCheck(app, {
              provider: new ReCaptchaEnterpriseProvider(reCaptchaKey),
              isTokenAutoRefreshEnabled: true 
            });
        } catch(e) {
            console.warn("App Check initialization failed. This may happen in some environments like service workers.", e);
        }
=======
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(reCaptchaKey),
        // Set to 'true' to only allow valid App Check tokens.
        // Set to 'false' to allow requests without a valid token, but with a warning.
        isTokenAutoRefreshEnabled: true
      });
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4
    }
  }

  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  services = { firebaseApp: app, auth, firestore, storage };

  return services;
}
