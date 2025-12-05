
'use client';

import { useFirebase } from '@/firebase/provider';
import type { User } from 'firebase/auth';

interface FirebaseUserResult {
  user: User | null;
  isUserLoading: boolean;
}

/**
 * DEPRECATED: This hook is deprecated. Please import `useUser` directly from `@/firebase` or `@/firebase/provider`.
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): FirebaseUserResult => {
  const { user, isUserLoading } = useFirebase();
  return { user, isUserLoading };
};
