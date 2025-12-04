
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
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
    appCheck: AppCheck | null;
}

// This function is now designed to only be called once.
function initializeFirebase(): FirebaseServices {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    let appCheck: AppCheck | null = null;
    if (typeof window !== 'undefined') {
        // Crucial for local development to prevent internal auth errors.
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        
        try {
            appCheck = initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
                isTokenAutoRefreshEnabled: true,
            });
        } catch (e) {
            console.error("Firebase App Check initialization failed:", e);
        }
    }

    // Services are initialized after App Check setup.
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    
    return { app, auth, firestore, storage, appCheck };
}

// Memoize the initialization to ensure it runs only once.
const firebaseServices = initializeFirebase();

export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const { auth } = firebaseServices;
        
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsAuthLoading(false);
        }, (authError) => {
            console.error("Auth state change error:", authError);
            setError(authError);
            setIsAuthLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    // The context value is memoized to prevent unnecessary re-renders.
    const contextValue = useMemo(() => ({
        firebaseApp: firebaseServices.app,
        auth: firebaseServices.auth,
        firestore: firebaseServices.firestore,
        storage: firebaseServices.storage,
        user,
        isUserLoading: isAuthLoading,
        // Services are considered available if they have been initialized.
        areServicesAvailable: !!(firebaseServices.auth && firebaseServices.firestore && firebaseServices.storage),
        userError: error,
    }), [user, isAuthLoading, error]);

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}

    