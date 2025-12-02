
'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { FirebaseApp } from 'firebase/app';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
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

// Store services in a module-level variable to ensure they are initialized only once.
let firebaseServices: FirebaseServices | null = null;

function getFirebaseServices() {
    if (!firebaseServices) {
        const { firebaseApp, auth, firestore, storage } = initializeFirebase();
        firebaseServices = { app: firebaseApp, auth, firestore, storage };
    }
    return firebaseServices;
}


export default function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Get services. This will initialize them on the first render on the client.
  const services = getFirebaseServices();

  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // This effect runs only once on the client to set up the auth listener.
    const unsubscribe = onAuthStateChanged(services.auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsAuthLoading(false);
    }, (error) => {
      console.error("Firebase auth state error:", error);
      setUser(null);
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once.

  return (
    <FirebaseProvider
      firebaseApp={services.app}
      auth={services.auth}
      firestore={services.firestore}
      storage={services.storage}
      user={user}
      isUserLoading={isAuthLoading}
    >
      <FirebaseErrorListener />
      {children}
    </FirebaseProvider>
  );
}
