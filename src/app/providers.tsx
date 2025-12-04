'use client';
import { useEffect } from 'react';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useFirebase } from '@/firebase';

function AppCheckInitiator() {
    const { firebaseApp } = useFirebase(); // Gets the initialized app from context
    useEffect(() => {
        // The initializeAppCheck is already called in initializeFirebase,
        // this component just ensures the provider is mounted and ready.
        if (firebaseApp) {
            // console.log("Firebase App and App Check are ready.");
        }
    }, [firebaseApp]);
    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FirebaseClientProvider>
            <AppCheckInitiator />
            {children}
        </FirebaseClientProvider>
    );
}
