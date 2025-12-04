
'use client';

import React, { createContext, useContext, ReactNode, useMemo, DependencyList } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';
import { Auth, User } from 'firebase/auth';

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
}

// Return type for useFirebase() and other hooks
export interface FirebaseServicesAndUser {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
}

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
  areServicesAvailable: boolean;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  storage,
  user,
  isUserLoading,
  areServicesAvailable,
}) => {
  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    return {
      areServicesAvailable,
      firebaseApp,
      firestore,
      auth,
      storage,
      user,
      isUserLoading,
    };
  }, [firebaseApp, firestore, auth, storage, user, isUserLoading, areServicesAvailable]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if used outside FirebaseProvider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  return {
    areServicesAvailable: context.areServicesAvailable,
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    storage: context.storage,
    user: context.user,
    isUserLoading: context.isUserLoading,
  };
};

/** Hook to access Firebase Auth instance and user state. */
export const useAuth = (): FirebaseServicesAndUser => {
  return useFirebase();
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase Storage instance. */
export const useStorage = (): FirebaseStorage | null => {
    const { storage } = useFirebase();
    return storage;
}

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

/**
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): Pick<FirebaseServicesAndUser, 'user' | 'isUserLoading'> => {
  const { user, isUserLoading } = useFirebase();
  return { user, isUserLoading };
};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
}
