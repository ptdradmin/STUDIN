// src/firebase/firestore/use-doc.tsx
'use client';
import {
  doc,
  DocumentData,
  FirestoreError,
  onSnapshot,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useFirestore } from '../provider';

export function useDoc<T>(path: string, id: string) {
  const firestore = useFirestore();
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError>();

  useEffect(() => {
    if (!firestore) return;
    const docRef = doc(firestore, path, id);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id } as T);
        } else {
          setData(undefined);
        }
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [firestore, path, id]);

  return { data, loading, error };
}
