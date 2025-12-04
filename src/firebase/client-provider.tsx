
'use client';

import React, { useEffect, useState, ReactNode, useMemo, createContext } from 'react';
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

const FirebaseServicesContext = createContext<FirebaseServices | null>(null);

let firebaseServices: FirebaseServices | null = null;

function getFirebaseServices(): FirebaseServices {
    if (firebaseServices) {
        return firebaseServices;
    }

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    let appCheck: AppCheck | null = null;
    if (typeof window !== 'undefined') {
        // This is necessary for local development and CI environments.
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

    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    
    firebaseServices = { app, auth, firestore, storage, appCheck };
    return firebaseServices;
}


export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [services, setServices] = useState<FirebaseServices | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        try {
            const initializedServices = getFirebaseServices();
            setServices(initializedServices);

            const unsubscribe = onAuthStateChanged(initializedServices.auth, (firebaseUser) => {
                setUser(firebaseUser);
                setIsAuthLoading(false);
            }, (authError) => {
                console.error("Auth state change error:", authError);
                setError(authError);
                setIsAuthLoading(false);
            });

            return () => unsubscribe();
        } catch (initError: any) {
            console.error("Firebase initialization error:", initError);
            setError(initError);
            setIsAuthLoading(false);
        }
    }, []);

    const contextValue: FirebaseContextState = useMemo(() => ({
        firebaseApp: services?.app || null,
        auth: services?.auth || null,
        firestore: services?.firestore || null,
        storage: services?.storage || null,
        user,
        isUserLoading: isAuthLoading || !services,
        areServicesAvailable: !!services,
        userError: error,
    }), [services, user, isAuthLoading, error]);

    if (isAuthLoading || !services) {
        return <PageSkeleton />;
    }

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}
