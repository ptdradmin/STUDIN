'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, getAuth } from 'firebase/auth';
import { FirebaseStorage, getStorage } from "firebase/storage";
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { initializeFirebase } from '.';

// Define the shape of the context
interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
  areServicesAvailable: boolean;
  userError: Error | null;
}

// Create the context with an undefined initial value
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
}

/**
 * Provides Firebase services and user authentication state to the app.
 * This component should wrap the root of your application.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [firestore, setFirestore] = useState<Firestore | null>(null);
  const [storage, setStorage] = useState<FirebaseStorage | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  // Initialize Firebase app and services once on mount
  useEffect(() => {
    try {
      const { firebaseApp: app, auth: authInstance, firestore: dbInstance, storage: storageInstance } = initializeFirebase();
      setFirebaseApp(app);
      setAuth(authInstance);
      setFirestore(dbInstance);
      setStorage(storageInstance);
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      setUserError(e as Error);
    }
  }, []);

  // Subscribe to authentication state changes
  useEffect(() => {
    if (!auth) {
      setIsUserLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setIsUserLoading(false);
      },
      (error) => {
        console.error("Firebase auth state error:", error);
        setUserError(error);
        setIsUserLoading(false);
      }
    );

    return () => unsubscribe(); // Cleanup subscription
  }, [auth]);

  const areServicesAvailable = !!(firebaseApp && auth && firestore);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    firebaseApp,
    auth,
    firestore,
    storage,
    user,
    isUserLoading,
    areServicesAvailable,
    userError,
  }), [firebaseApp, auth, firestore, storage, user, isUserLoading, areServicesAvailable, userError]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};


/**
 * Hook to access core Firebase services and user authentication state.
 * Throws an error if used outside a FirebaseProvider.
 */
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth | null => {
  return useFirebase().auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
  return useFirebase().firestore;
};

/** Hook to access Firebase Storage instance. */
export const useStorage = (): FirebaseStorage | null => {
  return useFirebase().storage;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
  return useFirebase().firebaseApp;
};

/**
 * Custom hook to memoize Firebase queries or references.
 * This is crucial to prevent infinite loops in `useEffect` hooks within `useCollection` and `useDoc`.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
    const memoized = useMemo(factory, deps);
    
    if (typeof memoized !== 'object' || memoized === null) {
      return memoized;
    }
    
    // Tag the object to indicate it has been memoized.
    (memoized as T & { __memo?: boolean }).__memo = true;
    
    return memoized;
}
