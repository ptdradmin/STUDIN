
'use client';

import React, { useEffect, useState, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { FirebaseProvider, FirebaseContextState } from '@/firebase/provider';
import { firebaseConfig } from './config';
import { PageSkeleton } from '@/components/page-skeleton';

interface FirebaseServices {
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
}

let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

if (typeof window !== 'undefined') {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
    isTokenAutoRefreshEnabled: true,
  });
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsLoading(false);
        }, (authError) => {
            console.error("Auth state change error:", authError);
            setError(authError);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const contextValue: FirebaseContextState = useMemo(() => ({
        firebaseApp: firebaseApp,
        auth: auth,
        firestore: firestore,
        storage: storage,
        user,
        isUserLoading: isLoading,
        areServicesAvailable: true, // Services are initialized globally now
        userError: error,
    }), [user, isLoading, error]);

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}
