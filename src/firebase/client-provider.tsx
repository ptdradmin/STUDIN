
'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { FirebaseApp } from 'firebase/app';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import FirebaseErrorListener from '@/components/FirebaseErrorListener';
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

interface FirebaseClientProviderProps {
  children: ReactNode;
}

interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

export default function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // This effect runs only once on the client to initialize Firebase services
    if (typeof window !== 'undefined' && !firebaseServices) {
        const { firebaseApp, auth, firestore, storage } = initializeFirebase();
        setFirebaseServices({ app: firebaseApp, auth, firestore, storage });
        
        // Initialize App Check with reCAPTCHA v3
        initializeAppCheck(firebaseApp, {
          provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!),
          isTokenAutoRefreshEnabled: true
        });

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser);
          setIsAuthLoading(false);
        }, (error) => {
          console.error("Firebase auth state error:", error);
          setUser(null);
          setIsAuthLoading(false);
        });

        return () => unsubscribe();
    }
  }, [firebaseServices]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices?.app ?? null}
      auth={firebaseServices?.auth ?? null}
      firestore={firebaseServices?.firestore ?? null}
      storage={firebaseServices?.storage ?? null}
      user={user}
      isUserLoading={isAuthLoading}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
