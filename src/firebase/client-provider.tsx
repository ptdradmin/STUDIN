
'use client';

import React, { useEffect, useState, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { FirebaseProvider, FirebaseContextState } from '@/firebase/provider';
import { firebaseConfig } from './config';

interface FirebaseServices {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
}

// Singleton pattern to ensure Firebase is initialized only once.
let firebaseServices: FirebaseServices | null = null;
let appCheckPromise: Promise<void> | null = null;

async function getFirebaseServices(): Promise<FirebaseServices> {
    if (firebaseServices) {
        if (appCheckPromise) await appCheckPromise;
        return firebaseServices;
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    if (typeof window !== 'undefined') {
        if (!appCheckPromise) {
            appCheckPromise = new Promise<void>((resolve, reject) => {
                try {
                    // IMPORTANT: Replace with your actual reCAPTCHA v3 site key
                    const recaptchaProvider = new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS');
                    initializeAppCheck(app, {
                        provider: recaptchaProvider,
                        isTokenAutoRefreshEnabled: true,
                    });
                    console.log("Firebase App Check initialized.");
                    resolve();
                } catch (error) {
                    console.error("Firebase App Check initialization error:", error);
                    reject(error);
                }
            });
        }
        // Wait for App Check to be initialized
        await appCheckPromise;
    }
    
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    firebaseServices = { firebaseApp: app, auth, firestore, storage };

    return firebaseServices;
}


export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [services, setServices] = useState<FirebaseServices | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const initializeAndAuth = async () => {
            try {
                const loadedServices = await getFirebaseServices();
                setServices(loadedServices);
                
                // Now that services (including App Check) are ready, set up the auth listener.
                const unsubscribe = onAuthStateChanged(loadedServices.auth, (firebaseUser) => {
                    setUser(firebaseUser);
                    setIsAuthLoading(false);
                }, (authError) => {
                    console.error("Auth state change error:", authError);
                    setError(authError);
                    setIsAuthLoading(false);
                });
                return () => unsubscribe();
            } catch (initError: any) {
                console.error("Failed to initialize Firebase services:", initError);
                setError(initError);
                setIsAuthLoading(false);
            }
        };

        initializeAndAuth();
    }, []);

    const contextValue = useMemo(() => ({
        firebaseApp: services?.firebaseApp || null,
        auth: services?.auth || null,
        firestore: services?.firestore || null,
        storage: services?.storage || null,
        user,
        isUserLoading: isAuthLoading,
        areServicesAvailable: !!services,
        userError: error,
    }), [services, user, isAuthLoading, error]);

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}
