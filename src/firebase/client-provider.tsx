
'use client';

import React, { useEffect, useState, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from './config';

interface FirebaseServices {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
}

// Singleton pattern to ensure Firebase is initialized only once.
let firebaseApp: FirebaseApp | null = null;
let appCheckInstance: AppCheck | null = null;

function getFirebaseApp(): FirebaseApp {
    if (firebaseApp) {
        return firebaseApp;
    }
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firebaseApp = app;
    return app;
}


export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [authInstance, setAuthInstance] = useState<Auth | null>(null);
    const [firestoreInstance, setFirestoreInstance] = useState<Firestore | null>(null);
    const [storageInstance, setStorageInstance] = useState<FirebaseStorage | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const app = getFirebaseApp();

        // Initialize services immediately
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        const storage = getStorage(app);
        
        setAuthInstance(auth);
        setFirestoreInstance(firestore);
        setStorageInstance(storage);

        let unsubscribe: (() => void) | undefined;

        const initialize = async () => {
             if (typeof window !== 'undefined') {
                try {
                    if (!appCheckInstance) {
                        const provider = new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS');
                        appCheckInstance = initializeAppCheck(app, {
                            provider: provider,
                            isTokenAutoRefreshEnabled: true,
                        });
                        console.log("Firebase App Check initialized.");
                    }
                } catch (e: any) {
                    console.error("Firebase App Check initialization error:", e);
                    setError(e);
                    setIsAuthLoading(false); // Stop loading on error
                    return;
                }
            }

            // Now that App Check is initialized (or skipped on server), set up auth listener.
            unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                setUser(firebaseUser);
                setIsAuthLoading(false);
            }, (authError) => {
                console.error("Auth state change error:", authError);
                setError(authError);
                setIsAuthLoading(false);
            });
        };

        initialize();

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    const contextValue = useMemo(() => ({
        firebaseApp: firebaseApp,
        auth: authInstance,
        firestore: firestoreInstance,
        storage: storageInstance,
        user,
        isUserLoading: isAuthLoading,
        areServicesAvailable: !!authInstance && !!firestoreInstance && !!storageInstance,
        userError: error,
    }), [authInstance, firestoreInstance, storageInstance, user, isAuthLoading, error]);

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}

