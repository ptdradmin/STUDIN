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

// Singleton instances of Firebase services
let firebaseServices: FirebaseServices | null = null;
let appCheckPromise: Promise<void> | undefined;

function getFirebaseServices(): FirebaseServices {
  if (firebaseServices) {
    return firebaseServices;
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  if (typeof window !== 'undefined') {
    if (!appCheckPromise) {
        appCheckPromise = new Promise<void>((resolve, reject) => {
            try {
                initializeAppCheck(app, {
                    provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
                    isTokenAutoRefreshEnabled: true,
                });
                // App Check initialization is asynchronous. While we can't directly await it here
                // in a simple singleton pattern, its initialization is kicked off.
                // The onAuthStateChanged listener setup will implicitly wait.
                resolve();
            } catch (error) {
                console.error("App Check initialization failed:", error);
                reject(error);
            }
        });
    }
  }

  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  
  firebaseServices = { app, auth, firestore, storage };
  return firebaseServices;
}


export default function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services] = useState<FirebaseServices>(getFirebaseServices);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth(services.app);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    }, (error) => {
      console.error("Firebase auth state error:", error);
      setUser(null);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [services.app]);

  return (
    <FirebaseProvider
      firebaseApp={services.app}
      auth={services.auth}
      firestore={services.firestore}
      storage={services.storage}
      user={user}
      isUserLoading={isAuthLoading}
      areServicesAvailable={!!services}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
