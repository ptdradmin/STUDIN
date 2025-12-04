
'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getApps, initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from '@/firebase/config';
import FirebaseErrorListener from '@/components/FirebaseErrorListener';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

// Lazy-loaded, singleton instance of Firebase services
let firebaseServices: FirebaseServices | null = null;

function getFirebaseServices(): FirebaseServices {
  if (firebaseServices) {
    return firebaseServices;
  }

  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    if (typeof window !== 'undefined') {
      // Initialize App Check
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
        isTokenAutoRefreshEnabled: true
      });
    }
  }
  
  const app = getApp();
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  firebaseServices = { app, auth, firestore, storage };
  return firebaseServices;
}


export default function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const services = getFirebaseServices();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(services.auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    }, (error) => {
      console.error("Firebase auth state error:", error);
      setUser(null);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [services.auth]);

  return (
    <FirebaseProvider
      firebaseApp={services.app}
      auth={services.auth}
      firestore={services.firestore}
      storage={services.storage}
      user={user}
      isUserLoading={isAuthLoading}
      areServicesAvailable={true} // Services are always available with this setup
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
