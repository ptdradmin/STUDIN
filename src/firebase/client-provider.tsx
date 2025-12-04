'use client';

import React, { useEffect, useState, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from './config';

// Ensure Firebase is initialized only once.
function getFirebaseApp(): FirebaseApp {
    if (getApps().length === 0) {
        return initializeApp(firebaseConfig);
    }
    return getApp();
}

const app = getFirebaseApp();
let appCheck: AppCheck | undefined;

if (typeof window !== 'undefined') {
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
    isTokenAutoRefreshEnabled: true,
  });
}

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);


export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsAuthLoading(false);
        }, (authError) => {
            console.error("Auth state change error:", authError);
            setError(authError);
            setIsAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const contextValue = useMemo(() => ({
        firebaseApp: app,
        auth: auth,
        firestore: firestore,
        storage: storage,
        user,
        isUserLoading: isAuthLoading,
        areServicesAvailable: !!auth && !!firestore && !!storage,
        userError: error,
    }), [user, isAuthLoading, error]);

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}