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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isAppCheckInitialized, setIsAppCheckInitialized] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && !isAppCheckInitialized) {
            // Poll for the grecaptcha.ready function to be available.
            const intervalId = setInterval(() => {
                if ((window as any).grecaptcha?.ready) {
                    clearInterval(intervalId); // Stop polling
                    try {
                        // Prevent re-initialization if it somehow runs again
                        if (!(firebaseApp as any)._appCheck) {
                          initializeAppCheck(firebaseApp, {
                            provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
                            isTokenAutoRefreshEnabled: true,
                          });
                        }
                        setIsAppCheckInitialized(true);
                    } catch (e: any) {
                        console.error("Failed to initialize App Check:", e);
                        setError(e);
                    }
                }
            }, 100); // Check every 100ms

            return () => clearInterval(intervalId); // Cleanup on unmount
        }
    }, [isAppCheckInitialized]);

    useEffect(() => {
        // We only start listening to auth changes after app check is initialized
        if (!isAppCheckInitialized) return;

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsLoading(false);
        }, (authError) => {
            console.error("Auth state change error:", authError);
            setError(authError);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [isAppCheckInitialized]);

    const contextValue: FirebaseContextState = useMemo(() => ({
        firebaseApp: firebaseApp,
        auth: auth,
        firestore: firestore,
        storage: storage,
        user,
        isUserLoading: isLoading || !isAppCheckInitialized,
        areServicesAvailable: isAppCheckInitialized,
        userError: error,
    }), [user, isLoading, error, isAppCheckInitialized]);

    if (isLoading || !isAppCheckInitialized) {
        return <PageSkeleton />;
    }

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}
