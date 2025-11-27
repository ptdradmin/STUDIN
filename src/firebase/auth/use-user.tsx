
'use client';

import { useFirebase } from '@/firebase/provider';
import type { FirebaseServicesAndUser } from '@/firebase/provider';

/**
 * Hook specifically for accessing the authenticated user's state.
 */
export const useUser = (): Pick<FirebaseServicesAndUser, 'user' | 'isUserLoading'> => {
  const { user, isUserLoading } = useFirebase();
  return { user, isUserLoading };
};
