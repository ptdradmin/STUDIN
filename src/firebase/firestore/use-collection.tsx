// src/firebase/firestore/use-collection.tsx
'use client';
import {
  DocumentData,
  FirestoreError,
  Query,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useFirestore } from '../provider';

export function useCollection<T>(path: string) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError>();

  useEffect(() => {
    if (!firestore) return;
    const collectionRef = collection(firestore, path) as Query<
      T,
      DocumentData
    >;

    const unsubscribe = onSnapshot(
      collectionRef,
      (snapshot) => {
        setData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [firestore, path]);

  return { data, loading, error };
}
