// src/firebase/client-provider.tsx
'use client';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import { useMemo } from 'react';

import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';

type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

export default function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const firebaseServices = useMemo<FirebaseServices>(() => {
    const app = initializeFirebase();
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    return { app, auth, firestore };
  }, []);

  return (
    <FirebaseProvider
      app={firebaseServices.app}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
