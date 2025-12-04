
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

export const createUserDocument = async (
  firestore: Firestore,
  user: User,
  additionalData: Record<string, any> = {}
) => {
  if (!user) {
    throw new Error("L'objet utilisateur est requis pour créer un document utilisateur.");
  }

  const userDocRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    console.log("Le document utilisateur existe déjà pour :", user.uid);
    return;
  }
  
  const { email, displayName, photoURL } = user;
  
  const username = (additionalData.username || email?.split('@')[0] || `user_${user.uid.slice(0, 6)}`)
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, '');

  const firstName = additionalData.firstName || displayName?.split(' ')[0] || '';
  const lastName = additionalData.lastName || displayName?.split(' ')[1] || '';
  
  const userData = {
      id: user.uid,
      role: 'student',
      email,
      username,
      firstName,
      lastName,
      postalCode: additionalData.postalCode || '',
      city: additionalData.city || '',
      university: additionalData.university || '',
      fieldOfStudy: additionalData.fieldOfStudy || '',
      bio: '',
      website: '',
      profilePicture: photoURL || generateAvatar(user.email || user.uid),
      followerIds: [],
      followingIds: [],
      isVerified: false,
      points: 0,
      challengesCompleted: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
  };

  // La règle de sécurité `allow create: if request.auth.uid == userId;` fonctionnera ici.
  await setDoc(userDocRef, userData);

  const newDisplayName = `${firstName} ${lastName}`.trim();
  if (user && (user.displayName !== newDisplayName || user.photoURL !== userData.profilePicture)) {
    await updateProfile(user, { displayName: newDisplayName, photoURL: userData.profilePicture });
  }
};
