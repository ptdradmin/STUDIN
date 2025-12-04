'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { FirebaseProvider, FirebaseContextState } from '@/firebase/provider';
import { firebaseConfig } from './config';

// Singleton pattern for Firebase services
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;
let storage: FirebaseStorage;
let appCheckPromise: Promise<void> | null = null;

function getFirebaseServices() {
    if (!getApps().length) {
        firebaseApp = initializeApp(firebaseConfig);
        auth = getAuth(firebaseApp);
        firestore = getFirestore(firebaseApp);
        storage = getStorage(firebaseApp);

        if (typeof window !== 'undefined') {
            appCheckPromise = initializeAppCheck(firebaseApp, {
                provider: new ReCaptchaV3Provider('6Ld-9PUpAAAAAKj3A22-EclMhTuA2vo-A9g5tYy8'),
                isTokenAutoRefreshEnabled: true
            }).then(() => {
                console.log("Firebase App Check initialized successfully.");
            }).catch(error => {
                console.error("Firebase App Check initialization error:", error);
            });
        }
    } else {
        firebaseApp = getApp();
        auth = getAuth(firebaseApp);
        firestore = getFirestore(firebaseApp);
        storage = getStorage(firebaseApp);
    }
    return { firebaseApp, auth, firestore, storage, appCheckPromise };
}

export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const services = useMemo(() => getFirebaseServices(), []);

    useEffect(() => {
        const { auth, appCheckPromise } = services;
        
        const setupAuthListener = () => {
            const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                setUser(firebaseUser);
                setIsAuthLoading(false);
            });
            return unsubscribe;
        };

        if (appCheckPromise) {
            appCheckPromise.finally(setupAuthListener);
        } else {
            // Fallback for environments where app check is not initialized (e.g. server-side)
            return setupAuthListener();
        }

    }, [services]);

    const contextValue = useMemo(() => ({
        firebaseApp: services.firebaseApp,
        auth: services.auth,
        firestore: services.firestore,
        storage: services.storage,
        user,
        isUserLoading: isAuthLoading,
    }), [services, user, isAuthLoading]);

    return (
        <FirebaseProvider value={contextValue as FirebaseContextState}>
            {children}
        </FirebaseProvider>
    );
}
