
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { FirebaseProvider, FirebaseContextState } from '@/firebase/provider';
import { firebaseConfig } from './config';

// Define a type for our services to ensure consistency
interface FirebaseServices {
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
}

// Singleton pattern for Firebase services to prevent re-initialization
let firebaseServices: FirebaseServices | null = null;

async function getFirebaseServices(): Promise<FirebaseServices> {
    if (firebaseServices) {
        return firebaseServices;
    }

    if (getApps().length === 0) {
        const firebaseApp = initializeApp(firebaseConfig);

        // Initialize App Check only on the client
        if (typeof window !== 'undefined') {
            try {
                initializeAppCheck(firebaseApp, {
                    provider: new ReCaptchaV3Provider('6Ld-9PUpAAAAAKj3A22-EclMhTuA2vo-A9g5tYy8'),
                    isTokenAutoRefreshEnabled: true
                });
            } catch (error) {
                console.error("Firebase App Check initialization error:", error);
            }
        }
        
        const auth = getAuth(firebaseApp);
        const firestore = getFirestore(firebaseApp);
        const storage = getStorage(firebaseApp);
        firebaseServices = { firebaseApp, auth, firestore, storage };

    } else {
        const firebaseApp = getApp();
        const auth = getAuth(firebaseApp);
        const firestore = getFirestore(firebaseApp);
        const storage = getStorage(firebaseApp);
        firebaseServices = { firebaseApp, auth, firestore, storage };
    }

    return firebaseServices;
}

export default function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [services, setServices] = useState<FirebaseServices | null>(null);

    useEffect(() => {
        getFirebaseServices().then(loadedServices => {
            setServices(loadedServices);
            const unsubscribe = onAuthStateChanged(loadedServices.auth, (firebaseUser) => {
                setUser(firebaseUser);
                setIsAuthLoading(false);
            });
            return () => unsubscribe();
        }).catch(error => {
            console.error("Failed to initialize Firebase services:", error);
            setIsAuthLoading(false);
        });
    }, []);

    const contextValue = useMemo(() => ({
        firebaseApp: services?.firebaseApp || null,
        auth: services?.auth || null,
        firestore: services?.firestore || null,
        storage: services?.storage || null,
        user,
        isUserLoading: isAuthLoading || !services,
    }), [services, user, isAuthLoading]);

    return (
        <FirebaseProvider value={contextValue as FirebaseContextState}>
            {children}
        </FirebaseProvider>
    );
}
