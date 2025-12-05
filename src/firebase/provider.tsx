
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseStorage } from "firebase/storage";
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Define the shape of the context
interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
  areServicesAvailable: boolean;
}

// Create the context with an undefined initial value
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
}

/**
 * Provides Firebase services and user authentication state to the app.
 * This component should wrap the root of your application.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children, firebaseApp, auth, firestore, storage }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    
    const areServicesAvailable = !!(firebaseApp && auth && firestore && storage);

    useEffect(() => {
        if (!auth) {
            setIsUserLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsUserLoading(false);
        }, (error) => {
            console.error("Firebase auth state error:", error);
            setIsUserLoading(false);
        });

        return () => unsubscribe();
    }, [auth]);

    const contextValue = useMemo(() => ({
        firebaseApp,
        auth,
        firestore,
        storage,
        user,
        isUserLoading,
        areServicesAvailable,
    }), [firebaseApp, auth, firestore, storage, user, isUserLoading, areServicesAvailable]);

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
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider.');
  }
  return context.auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirebaseProvider.');
  }
  return context.firestore;
};

/** Hook to access Firebase Storage instance. */
export const useStorage = (): FirebaseStorage | null => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a FirebaseProvider.');
  }
  return context.storage;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider.');
  }
  return context.firebaseApp;
};

/**
 * Custom hook to memoize Firebase queries or references.
 * This is crucial to prevent infinite loops in `useEffect` hooks within `useCollection` and `useDoc`.
 */
export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
    const memoized = useMemo(factory, deps);
    
    if (typeof memoized !== 'object' || memoized === null) {
      return memoized;
    }
    
    // Tag the object to indicate it has been memoized.
    (memoized as T & { __memo?: boolean }).__memo = true;
    
    return memoized;
}
