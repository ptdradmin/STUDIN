
'use client';

import React, { useEffect, useState, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { FirebaseProvider, FirebaseContextState } from '@/firebase/provider';
import { firebaseConfig } from './config';
import { PageSkeleton } from '@/components/page-skeleton';

interface FirebaseServices {
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
    appCheck: AppCheck | null;
}

let firebaseServices: FirebaseServices | null = null;

function initializeFirebaseServices(): FirebaseServices {
    if (firebaseServices) {
        return firebaseServices;
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    let appCheckInstance: AppCheck | null = null;
    if (typeof window !== 'undefined') {
        try {
            // This is necessary for local development and CI environments.
            (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
            appCheckInstance = initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
                isTokenAutoRefreshEnabled: true,
            });
        } catch (e) {
            console.error("Firebase App Check initialization failed:", e);
        }
    }

    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    
    firebaseServices = { app, auth, firestore, storage, appCheck: appCheckInstance };
    return firebaseServices;
}


export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    // Initialize services once.
    const services = useMemo(() => initializeFirebaseServices(), []);

    useEffect(() => {
        if (!services.auth) {
            setIsAuthLoading(false);
            return;
        }
        
        const unsubscribe = onAuthStateChanged(services.auth, (firebaseUser) => {
            setUser(firebaseUser);
            setIsAuthLoading(false);
        }, (authError) => {
            console.error("Auth state change error:", authError);
            setError(authError);
            setIsAuthLoading(false);
        });

        return () => unsubscribe();
    }, [services.auth]);

    const contextValue: FirebaseContextState = useMemo(() => ({
        firebaseApp: services.app,
        auth: services.auth,
        firestore: services.firestore,
        storage: services.storage,
        user,
        isUserLoading: isAuthLoading,
        areServicesAvailable: !!services,
        userError: error,
    }), [services, user, isAuthLoading, error]);

    if (isAuthLoading) {
        return <PageSkeleton />;
    }

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}

