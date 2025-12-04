
'use client';

import React, { useEffect, useState, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheckProvider, CustomProvider } from 'firebase/app-check';
import { FirebaseProvider, FirebaseContextState } from '@/firebase/provider';
import { firebaseConfig } from './config';
import { PageSkeleton } from '@/components/page-skeleton';
import { verifyRecaptcha } from '@/ai/flows/verify-recaptcha-flow';

interface FirebaseServices {
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
}

let firebaseServices: FirebaseServices | null = null;
let initializationPromise: Promise<FirebaseServices> | null = null;

function initializeFirebase(): Promise<FirebaseServices> {
    if (firebaseServices) {
        return Promise.resolve(firebaseServices);
    }
    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = new Promise(async (resolve, reject) => {
        try {
            const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

            if (typeof window !== 'undefined') {
                // Using a CustomProvider to ensure App Check is ready before the app continues.
                const recaptchaProvider = new CustomProvider({
                    getToken: () => {
                        return new Promise((resolveToken, rejectToken) => {
                             grecaptcha.enterprise.ready(() => {
                                grecaptcha.enterprise.execute('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS', { action: 'INITIALIZE' })
                                    .then(resolveToken)
                                    .catch(rejectToken);
                            });
                        });
                    }
                });

                initializeAppCheck(app, {
                  provider: recaptchaProvider,
                  isTokenAutoRefreshEnabled: true
                });
            }

            const auth = getAuth(app);
            const firestore = getFirestore(app);
            const storage = getStorage(app);

            firebaseServices = { app, auth, firestore, storage };
            resolve(firebaseServices);

        } catch (error) {
            console.error("Firebase initialization failed:", error);
            reject(error);
        }
    });
    return initializationPromise;
}

export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [services, setServices] = useState<FirebaseServices | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const firebaseServices = await initializeFirebase();
                setServices(firebaseServices);

                const unsubscribe = onAuthStateChanged(firebaseServices.auth, (firebaseUser) => {
                    setUser(firebaseUser);
                    setIsLoading(false);
                }, (authError) => {
                    console.error("Auth state change error:", authError);
                    setError(authError);
                    setIsLoading(false);
                });

                return () => unsubscribe();
            } catch (initError) {
                setError(initError as Error);
                setIsLoading(false);
            }
        };

        init();
    }, []);

    const contextValue: FirebaseContextState = useMemo(() => ({
        firebaseApp: services?.app || null,
        auth: services?.auth || null,
        firestore: services?.firestore || null,
        storage: services?.storage || null,
        user,
        isUserLoading: isLoading,
        areServicesAvailable: !!services,
        userError: error,
    }), [services, user, isLoading, error]);

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}
