
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
  appCheck: AppCheck;
}

// Singleton promise to ensure Firebase services are initialized only once.
let servicesPromise: Promise<FirebaseServices> | null = null;

const getFirebaseServices = (): Promise<FirebaseServices> => {
    if (servicesPromise) {
        return servicesPromise;
    }

    servicesPromise = new Promise(async (resolve, reject) => {
        try {
            const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

            let appCheck: AppCheck | undefined;
            if (typeof window !== 'undefined') {
                appCheck = initializeAppCheck(app, {
                    provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
                    isTokenAutoRefreshEnabled: true,
                });
            }
            
            if (!appCheck) {
                 throw new Error("App Check could not be initialized.");
            }

            const auth = getAuth(app);
            const firestore = getFirestore(app);
            const storage = getStorage(app);

            resolve({ app, auth, firestore, storage, appCheck });
        } catch (error) {
            reject(error);
        }
    });

    return servicesPromise;
};


export default function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    getFirebaseServices()
      .then(setServices)
      .catch(error => {
        console.error("Failed to initialize Firebase services:", error);
        setIsAuthLoading(false); 
      });
  }, []);

  useEffect(() => {
    if (!services) return;

    const unsubscribe = onAuthStateChanged(services.auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    }, (error) => {
      console.error("Firebase auth state error:", error);
      setUser(null);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [services]);

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

