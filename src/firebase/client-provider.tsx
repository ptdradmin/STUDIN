
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
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


interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

// Singleton pattern to initialize Firebase services
let firebaseServices: FirebaseServices | null = null;

function initializeFirebaseClient(): FirebaseServices {
  if (firebaseServices) {
    return firebaseServices;
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

  // Initialize App Check MUST be done right after app init and before other services
  if (typeof window !== 'undefined') {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (e) {
      console.error("Failed to initialize App Check", e);
    }
  }

  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  firebaseServices = { firebaseApp: app, auth, firestore, storage };
  return firebaseServices;
}

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // useMemo ensures that initialization only happens once per render cycle,
  // and the singleton pattern ensures it only happens once for the lifetime of the client app.
  const services = useMemo(() => initializeFirebaseClient(), []);

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
      storage={services.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
