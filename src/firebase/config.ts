// src/firebase/config.ts
import { FirebaseOptions } from 'firebase/app';

// This configuration is used for SERVER-SIDE rendering and build steps.
// It is replaced by the client-config on the client-side.
const firebaseConfig: FirebaseOptions = {
  apiKey: "server-placeholder",
  authDomain: "server-placeholder",
  projectId: "server-placeholder",
  storageBucket: "server-placeholder",
  messagingSenderId: "server-placeholder",
  appId: "server-placeholder",
};

export function getFirebaseConfig() {
  if (typeof window !== 'undefined') {
    // On the client, import the client-specific config
    return require('./client-config').firebaseConfig;
  }
  
  // On the server, return the placeholder config
  return firebaseConfig;
}
