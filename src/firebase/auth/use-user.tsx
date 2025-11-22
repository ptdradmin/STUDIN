// src/firebase/auth/use-user.tsx
'use client';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { useAuth } from '../provider';

export function useUser() {
  const { auth } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('onAuthStateChanged error', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
