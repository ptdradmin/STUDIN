import { getFirebaseServices } from '@/firebase/config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
    const { firebaseApp, auth, firestore } = getFirebaseServices();
    
    return { firebaseApp, auth, firestore };
}


export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';

// Explicitly re-exporting from provider to avoid conflicts.
export { useUser, useMemoFirebase } from './provider';
