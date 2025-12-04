
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
    const [isAppCheckReady, setIsAppCheckReady] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // This effect handles App Check initialization.
        // It polls until the reCAPTCHA script is ready.
        if (typeof window !== 'undefined') {
            if ((firebaseApp as any)._appCheck) {
                setIsAppCheckReady(true);
                return;
            }

            const intervalId = setInterval(() => {
                // Check if grecaptcha.ready is available
                if ((window as any).grecaptcha?.ready) {
                    clearInterval(intervalId);
                    try {
                        initializeAppCheck(firebaseApp, {
                            provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
                            isTokenAutoRefreshEnabled: true,
                        });
                        setIsAppCheckReady(true);
                    } catch (e) {
                        console.error("App Check initialization error:", e);
                        setError(e as Error);
                        setIsAppCheckReady(true); // Proceed even if App Check fails
                    }
                }
            }, 100); // Check every 100ms

            return () => clearInterval(intervalId); // Cleanup interval on unmount
        }
    }, []);

    useEffect(() => {
        // This effect handles user authentication state.
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsUserLoading(false);
        }, (authError) => {
            console.error("Auth state change error:", authError);
            setError(authError);
            setIsUserLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const contextValue: FirebaseContextState = useMemo(() => ({
        firebaseApp: firebaseApp,
        auth: auth,
        firestore: firestore,
        storage: storage,
        user,
        isUserLoading: isUserLoading || !isAppCheckReady,
        areServicesAvailable: !isUserLoading && isAppCheckReady,
        userError: error,
    }), [user, isUserLoading, isAppCheckReady, error]);
    
    // Show a loading skeleton until both user and App Check are ready
    if (isUserLoading || !isAppCheckReady) {
        return <PageSkeleton />;
    }

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}
