'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect, DependencyList } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { generateAvatar } from '@/lib/avatars';
import type { UserProfile } from '@/lib/types';
import { errorEmitter, FirestorePermissionError, setDocumentNonBlocking } from '@/firebase';


interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  storage: FirebaseStorage | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  storage: FirebaseStorage;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  storage,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

   useEffect(() => {
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth service not provided.") });
      return;
    }

    setUserAuthState({ user: null, isUserLoading: true, userError: null });

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
            // User is signed in. Check if their profile document exists in Firestore.
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            
            try {
                const userDocSnap = await getDoc(userDocRef);

                if (!userDocSnap.exists()) {
                    // User document doesn't exist, this is a new user. Create it.
                    // This logic is now robust because onAuthStateChanged guarantees an authenticated user.
                    const username = firebaseUser.email?.split('@')[0] || `user${Math.random().toString(36).substring(2, 8)}`;
                    const userData: Omit<UserProfile, 'createdAt' | 'updatedAt'> & { createdAt: any, updatedAt: any } = {
                        id: firebaseUser.uid,
                        role: 'student', // Default role
                        email: firebaseUser.email || '',
                        username: username,
                        firstName: firebaseUser.displayName?.split(' ')[0] || '',
                        lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                        postalCode: '',
                        city: '',
                        university: '',
                        fieldOfStudy: '',
                        bio: '',
                        profilePicture: firebaseUser.photoURL || generateAvatar(firebaseUser.email || firebaseUser.uid),
                        followerIds: [],
                        followingIds: [],
                        isVerified: false,
                        isPro: false,
                        points: 0,
                        challengesCompleted: 0,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    };
                    
                    // USE NON-BLOCKING WRITE
                    setDocumentNonBlocking(userDocRef, userData, { merge: false });
                }
            } catch (e) {
                console.error("[FirebaseProvider] Error ensuring user document exists:", e);
                // If this fails, it's a critical permission issue. Emit a detailed error.
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: userDocRef.path,
                    operation: 'get', // or 'create' if getDoc failed
                    requestResourceData: { email: firebaseUser.email }, // Example data
                }));
            }
        }
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        console.error("[FirebaseProvider] onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    return () => unsubscribe();
  }, [auth, firestore]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth && storage);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      storage: servicesAvailable ? storage : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, storage, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth || !context.storage) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    storage: context.storage,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = () => {
  const { auth, user, isUserLoading, userError } = useFirebase();
  return { auth, user, isUserLoading, userError };
};

export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

export const useStorage = (): FirebaseStorage => {
    const { storage } = useFirebase();
    return storage;
};

/**
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};

/**
 * A custom hook that memoizes a value but only if the `areServicesAvailable`
 * flag from `useFirebase` is true. If services are not available, it returns null.
 * This is crucial for memoizing Firestore queries or references that depend on a
 * logged-in user or other dynamic data.
 *
 * @param factory A function that creates the value to be memoized.
 * @param deps The dependency array for the `useMemo` hook.
 * @returns The memoized value, or null if Firebase services are not available.
 */
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | null {
    const { areServicesAvailable } = useFirebase();

    // The factory function is only called when the dependencies change,
    // and the result is memoized.
    const memoizedValue = useMemo(factory, deps);

    // We only return the memoized value if Firebase services are ready.
    // This prevents components from trying to use Firestore queries or references
    // before the Firebase context is fully initialized, which could lead to errors.
    return areServicesAvailable ? memoizedValue : null;
}
