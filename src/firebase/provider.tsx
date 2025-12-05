
'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseStorage } from "firebase/storage";
import { getFirebaseServices, type FirebaseServices } from './config';
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
}

/**
 * Provides Firebase services and user authentication state to the app.
 * This component should wrap the root of your application.
 * It handles the initialization of Firebase services on the client side.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    
    // useMemo ensures that getFirebaseServices is called only once per client session.
    const services: FirebaseServices | null = useMemo(() => {
        if (typeof window !== 'undefined') {
            return getFirebaseServices();
        }
        return null;
    }, []);

    const areServicesAvailable = !!(services?.firebaseApp && services?.auth && services?.firestore && services?.storage);

    useEffect(() => {
        if (!services?.auth) {
            setIsUserLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(services.auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsUserLoading(false);
        }, (error) => {
            console.error("Firebase auth state error:", error);
            setIsUserLoading(false);
        });

        return () => unsubscribe();
    }, [services?.auth]);

    const contextValue = useMemo(() => ({
        firebaseApp: services?.firebaseApp || null,
        auth: services?.auth || null,
        firestore: services?.firestore || null,
        storage: services?.storage || null,
        user,
        isUserLoading,
        areServicesAvailable,
    }), [services, user, isUserLoading, areServicesAvailable]);

    return (
        <FirebaseContext.Provider value={contextValue}>
            {children}
            <FirebaseErrorListener />
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
export const useAuth = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider.');
  }
  return { auth: context.auth, isUserLoading: context.isUserLoading };
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
