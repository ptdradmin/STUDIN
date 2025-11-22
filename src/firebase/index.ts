// src/firebase/index.ts
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';

import { getFirebaseConfig } from './config';
import FirebaseClientProvider from './client-provider';
import { useUser } from './auth/use-user';
import { useCollection } from './firestore/use-collection';
import { useDoc } from './firestore/use-doc';
import { useAuth, useFirebase, useFirebaseApp, useFirestore, FirebaseProvider } from './provider';

let firebaseApp: FirebaseApp;

const initializeFirebase = () => {
  const apps = getApps();
  if (apps.length === 0) {
    const firebaseConfig = getFirebaseConfig();
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = apps[0];
  }
  return firebaseApp;
};

export {
  FirebaseProvider,
  FirebaseClientProvider,
  initializeFirebase,
  useAuth,
  useCollection,
  useDoc,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useUser,
};
