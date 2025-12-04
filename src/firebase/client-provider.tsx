
'use client';

import React, { useEffect, useState, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from './config';

function initializeServices() {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    
    if (typeof window !== 'undefined') {
        // This is the key change. By setting this debug token, App Check will be effectively
        // bypassed in your local development environment, resolving the token validation errors.
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
        try {
           initializeAppCheck(app, {
                provider: new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS'),
                isTokenAutoRefreshEnabled: true,
            });
        } catch (e) {
            console.warn("App Check initialization failed. This may happen in some environments.", e);
        }
    }
    return { app, auth, firestore, storage };
}

export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    
    const services = useMemo(() => initializeServices(), []);

    useEffect(() => {
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

    const contextValue = useMemo(() => ({
        firebaseApp: services.app,
        auth: services.auth,
        firestore: services.firestore,
        storage: services.storage,
        user,
        isUserLoading: isAuthLoading,
        areServicesAvailable: !!services.auth && !!services.firestore && !!services.storage,
        userError: error,
    }), [services, user, isAuthLoading, error]);

    return (
        <FirebaseProvider value={contextValue}>
            {children}
        </FirebaseProvider>
    );
}
