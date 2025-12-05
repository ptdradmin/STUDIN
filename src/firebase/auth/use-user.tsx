
'use client';

import { useFirebase } from '@/firebase/provider';
import type { User } from 'firebase/auth';

interface FirebaseUserResult {
  user: User | null;
  isUserLoading: boolean;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): FirebaseUserResult => {
  const { user, isUserLoading } = useFirebase();
  return { user, isUserLoading };
};
