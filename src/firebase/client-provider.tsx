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

let firebaseServices: FirebaseServices | null = null;
let appCheckInitializationPromise: Promise<void> | null = null;

function getFirebaseServices(): { services: FirebaseServices | null, appCheckPromise: Promise<void> | null } {
  if (typeof window === 'undefined') {
    return { services: null, appCheckPromise: null };
  }

  if (!firebaseServices) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    firebaseServices = { app, auth, firestore, storage };

    // Initialize App Check only once
    appCheckInitializationPromise = new Promise((resolve, reject) => {
       try {
         const appCheck = initializeAppCheck(app, {
           provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
           isTokenAutoRefreshEnabled: true
         });
         // The promise resolves when app check is ready.
         // We don't have a direct hook, but initialization itself is the goal.
         resolve();
       } catch (error) {
         console.error("App Check initialization failed:", error);
         reject(error);
       }
    });
  }
  
  return { services: firebaseServices, appCheckPromise: appCheckInitializationPromise };
}

export default function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const { services: s, appCheckPromise } = getFirebaseServices();
    
    if (s && appCheckPromise) {
      setServices(s);
      
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
        console.error("App Check promise rejected, auth listener not set up.", error);
        setIsAuthLoading(false);
      });
    } else {
        setIsAuthLoading(false);
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
