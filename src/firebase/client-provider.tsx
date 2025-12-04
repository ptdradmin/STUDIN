
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
                    const recaptchaProvider = new ReCaptchaV3Provider('6LcimiAsAAAAAEYqnXn6r1SCpvlUYftwp9nK0wOS');
                    initializeAppCheck(app, {
                        provider: recaptchaProvider,
                        isTokenAutoRefreshEnabled: true,
                    });
                    resolve();
                } catch (error) {
                    console.error("Firebase App Check initialization error:", error);
                    reject(error);
                }
            });
        }
        await appCheckPromise;
    }
    
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    firebaseServices = { firebaseApp: app, auth, firestore, storage };

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
            }, (error) => {
                console.error("Auth state change error:", error);
                setIsAuthLoading(false);
            });
            return () => unsubscribe();
        }).catch(error => {
            console.error("Failed to initialize Firebase services:", error);
            setIsAuthLoading(false);
        });
    }, []);

    const contextValue = useMemo(() => {
      const areServicesAvailable = !!services;
      return {
        firebaseApp: services?.firebaseApp || null,
        auth: services?.auth || null,
        firestore: services?.firestore || null,
        storage: services?.storage || null,
        user,
        isUserLoading: isAuthLoading || !areServicesAvailable,
        areServicesAvailable,
        userError: null,
      };
    }, [services, user, isAuthLoading]);

    return (
        <FirebaseProvider value={contextValue as FirebaseContextState}>
            {children}
        </FirebaseProvider>
    );
}
