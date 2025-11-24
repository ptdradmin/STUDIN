
'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { FirebaseApp } from 'firebase/app';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { PageSkeleton } from '@/components/page-skeleton';
import FirebaseErrorListener from '@/components/FirebaseErrorListener';

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
      try {
        const { firebaseApp, auth, firestore, storage } = initializeFirebase();
        setFirebaseServices({ app: firebaseApp, auth, firestore, storage });
        
        // Set up the authentication state listener
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser);
          setIsAuthLoading(false); // Auth state is now known
        }, (error) => {
          console.error("Firebase auth state error:", error);
          setUser(null);
          setIsAuthLoading(false);
        });

        // Cleanup the listener on unmount
        return () => unsubscribe();

      } catch (error) {
        console.error("Firebase initialization failed:", error);
        setIsAuthLoading(false);
      }
    }
  }, [firebaseServices]);

  if (isAuthLoading || !firebaseServices) {
    // Show a skeleton loader while Firebase is initializing and auth state is being determined
    return <PageSkeleton />;
  }

  // Once initialized and auth state is known, provide services and user state to the app
  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.app}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
      storage={firebaseServices.storage}
      user={user}
      isUserLoading={isAuthLoading}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
