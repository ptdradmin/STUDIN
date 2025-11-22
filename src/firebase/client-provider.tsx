// src/firebase/client-provider.tsx
'use client';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import { useEffect, useState, useMemo } from 'react';

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
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    // Firebase is only available on the client
    if (typeof window !== 'undefined') {
      const app = initializeFirebase();
      const auth = getAuth(app);
      const firestore = getFirestore(app);
      setFirebaseServices({ app, auth, firestore });
    }
  }, []);

  if (!firebaseServices) {
    // During SSR or initial client render, Firebase is not initialized.
    // The components using Firebase will be client-side and will re-render.
    return <>{children}</>;
  }


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
