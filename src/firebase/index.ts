

import { getFirebaseServices } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
    const { firebaseApp, auth, firestore } = getFirebaseServices();

    if (process.env.NEXT_PUBLIC_EMULATOR_HOST) {
        if (!('_emulator' in auth) || !auth._emulator.options) {
             const authEmulatorHost = process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
            connectAuthEmulator(auth, `http://${authEmulatorHost}`, { disableWarnings: true });
        }
        if (!('_emulator' in firestore) || !firestore._emulator.options) {
            const firestoreEmulatorHost = process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
            const [host, port] = firestoreEmulatorHost.split(':');
            connectFirestoreEmulator(firestore, host, parseInt(port, 10));
        }
    }
    
    return { firebaseApp, auth, firestore };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
