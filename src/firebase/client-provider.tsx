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

let firebaseApp: FirebaseApp;
if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApp();
}

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isAppCheckInitialized, setIsAppCheckInitialized] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        // Poll for grecaptcha.ready
        const intervalId = setInterval(() => {
            if ((window as any).grecaptcha?.ready) {
                clearInterval(intervalId);
                try {
                    if (!(firebaseApp as any)._appCheck) {
                      initializeAppCheck(firebaseApp, {
                        provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
                        isTokenAutoRefreshEnabled: true,
                      });
                    }
                    setIsAppCheckInitialized(true);
                } catch (e) {
                    console.error("App Check initialization error:", e);
                    setError(e as Error);
                }
            }
        }, 100); // Check every 100ms

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (!isAppCheckInitialized) {
            return; // Wait for App Check
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsUserLoading(false);
        }, (authError) => {
            console.error("Auth state change error:", authError);
            setError(authError);
            setIsUserLoading(false);
        });

        return () => unsubscribe();
    }, [isAppCheckInitialized]);

    const contextValue: FirebaseContextState = useMemo(() => ({
        firebaseApp: firebaseApp,
        auth: auth,
        firestore: firestore,
        storage: storage,
        user,
        isUserLoading: isUserLoading || !isAppCheckInitialized,
        areServicesAvailable: !isUserLoading && isAppCheckInitialized,
        userError: error,
    }), [user, isUserLoading, error, isAppCheckInitialized]);

    const isLoading = isUserLoading || !isAppCheckInitialized;

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}
