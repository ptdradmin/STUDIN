// src/firebase/provider.tsx
'use client';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import { createContext, useContext } from 'react';

type FirebaseContextValue = {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextValue>({
  app: null,
  auth: null,
  firestore: null,
});

export const FirebaseProvider = ({
  children,
  ...rest
}: {
  children: React.ReactNode;
} & FirebaseContextValue) => {
  return (
    <FirebaseContext.Provider value={rest}>{children}</FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);

export const useFirebaseApp = () => {
  const { app } = useFirebase();
  if (!app) {
    throw new Error(
      'useFirebaseApp must be used within a FirebaseProvider.'
    );
  }
  return app;
};

export const useAuth = () => {
  const { auth } = useFirebase();
   if (!auth) {
    throw new Error(
      'useAuth must be used within a FirebaseProvider.'
    );
  }
  return { auth };
};

export const useFirestore = () => {
  const { firestore } = useFirebase();
  if (!firestore) {
    throw new Error(
      'useFirestore must be used within a FirebaseProvider.'
    );
  }
  return firestore;
};
