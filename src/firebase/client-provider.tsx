
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
let appCheckInitialized = false;

function getFirebaseServices(): FirebaseServices {
  if (firebaseServices) {
    return firebaseServices;
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  
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

    const initializeAuthListener = () => {
      const unsubscribe = onAuthStateChanged(s.auth, (firebaseUser) => {
        setUser(firebaseUser);
        setIsAuthLoading(false);
      }, (error) => {
        console.error("Firebase auth state error:", error);
        setUser(null);
        setIsAuthLoading(false);
      });
      return unsubscribe;
    };
    
    if (typeof window !== 'undefined' && !appCheckInitialized) {
        appCheckInitialized = true; // Set flag immediately to prevent re-initialization
        try {
            const appCheck = initializeAppCheck(s.app, {
              provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
              isTokenAutoRefreshEnabled: true
            });
            // App Check is initialized, now set up auth listener.
            const unsubscribe = initializeAuthListener();
            return () => unsubscribe();
        } catch(error) {
            console.error("App Check initialization failed:", error);
            setIsAuthLoading(false); // Stop loading on App Check failure
        }
    } else {
        const unsubscribe = initializeAuthListener();
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
