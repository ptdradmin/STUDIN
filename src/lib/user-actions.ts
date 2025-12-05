
'use client';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Firestore,
  query,
  collection,
  where,
  getDocs,
  WriteBatch
} from 'firebase/firestore';
import { User, updateProfile } from 'firebase/auth';
import { generateAvatar } from '@/lib/avatars';

export const isUsernameUnique = async (firestore: Firestore, username: string): Promise<boolean> => {
    const q = query(collection(firestore, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
};
