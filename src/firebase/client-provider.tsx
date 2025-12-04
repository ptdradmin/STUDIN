
'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getApps, initializeApp, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from '@/firebase/config';
import FirebaseErrorListener from '@/components/FirebaseErrorListener';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

let firebaseServices: FirebaseServices | null = null;
let appCheckPromise: Promise<AppCheck> | null = null;

function getFirebaseServices(): FirebaseServices {
  if (firebaseServices) {
    return firebaseServices;
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  if (typeof window !== 'undefined' && !appCheckPromise) {
    appCheckPromise = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
      isTokenAutoRefreshEnabled: true
    });
  }
  
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);

  firebaseServices = { app, auth, firestore, storage };
  return firebaseServices;
}

export default function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const s = getFirebaseServices();
    setServices(s);
    
    // Wait for app check to be ready before setting up auth listener
    if (appCheckPromise) {
      appCheckPromise.then(() => {
        const unsubscribe = onAuthStateChanged(s.auth, (firebaseUser) => {
          setUser(firebaseUser);
          setIsAuthLoading(false);
        }, (error) => {
          console.error("Firebase auth state error:", error);
          setUser(null);
          setIsAuthLoading(false);
        });
        return unsubscribe;
      }).catch(error => {
        console.error("App Check initialization failed:", error);
        setIsAuthLoading(false); // Stop loading on App Check failure
      });
    } else {
        // Fallback for environments where app check might not run (e.g. server-side)
        const unsubscribe = onAuthStateChanged(s.auth, (firebaseUser) => {
          setUser(firebaseUser);
          setIsAuthLoading(false);
        }, (error) => {
          console.error("Firebase auth state error:", error);
          setUser(null);
          setIsAuthLoading(false);
        });
        return () => unsubscribe();
    }

  }, []);

  return (
    <FirebaseProvider
      firebaseApp={services?.app || null}
      auth={services?.auth || null}
      firestore={services?.firestore || null}
      storage={services?.storage || null}
      user={user}
      isUserLoading={isAuthLoading}
      areServicesAvailable={!!services}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
