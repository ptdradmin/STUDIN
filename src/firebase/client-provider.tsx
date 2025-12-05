
'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { getFirebaseServices } from '@/firebase/config';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * This provider is responsible for calling getFirebaseServices on the client
 * and passing them to the core FirebaseProvider.
 * It ensures initialization happens only once on the client side.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // useMemo ensures that getFirebaseServices is called only once.
  const services = useMemo(() => getFirebaseServices(), []);

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
      storage={services.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
