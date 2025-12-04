
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


function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  const app = initializeApp(firebaseConfig);
  
  if (typeof window !== 'undefined') {
    // Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
    // key is the counterpart to the secret key you set in the Firebase console.
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),

      // Optional argument. If true, the SDK automatically refreshes App Check
      // tokens as needed.
      isTokenAutoRefreshEnabled: true
    });
  }

  return getSdks(app);
}


function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp),
  };
}

function getFirebaseServices() {
    if (!firebaseServices) {
        const { firebaseApp, auth, firestore, storage } = initializeFirebase();
        firebaseServices = { app: firebaseApp, auth, firestore, storage };
    }
    return firebaseServices;
}


export default function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [areServicesAvailable, setAreServicesAvailable] = useState(false);

  useEffect(() => {
    const initializedServices = getFirebaseServices();
    setServices(initializedServices);
    setAreServicesAvailable(true);

    const unsubscribe = onAuthStateChanged(initializedServices.auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    }, (error) => {
      console.error("Firebase auth state error:", error);
      setUser(null);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={services?.app ?? null}
      auth={services?.auth ?? null}
      firestore={services?.firestore ?? null}
      storage={services?.storage ?? null}
      user={user}
      isUserLoading={isAuthLoading}
      areServicesAvailable={areServicesAvailable}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}

