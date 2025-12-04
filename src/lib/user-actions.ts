
'use client';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { User, updateProfile } from 'firebase/auth';
import { generateAvatar } from '@/lib/avatars';

export const isUsernameUnique = async (firestore: Firestore, username: string): Promise<boolean> => {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
};

export const createUserDocument = async (
  firestore: Firestore,
  user: User,
  additionalData: Record<string, any> = {}
) => {
  const userDocRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return; // User document already exists
  }

  const { email, displayName, photoURL } = user;
  const [firstNameFromProvider, lastNameFromProvider] = displayName?.split(' ') || ['', ''];

  const firstName = additionalData.firstName || firstNameFromProvider || '';
  const lastName = additionalData.lastName || lastNameFromProvider || '';
  
  let username = additionalData.username || '';
  if (!username) {
      let base = email?.split('@')[0] || `user${user.uid.substring(0,6)}`;
      username = base.toLowerCase().replace(/[^a-z0-9_.]/g, '');
      let isUnique = await isUsernameUnique(firestore, username);
      let counter = 1;
      while(!isUnique) {
          const newUsername = `${username}${counter}`;
          isUnique = await isUsernameUnique(firestore, newUsername);
          if (isUnique) {
              username = newUsername;
          }
          counter++;
      }
  }

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

  await setDoc(userDocRef, userData);

  const newDisplayName = `${firstName} ${lastName}`.trim();
  if (user && (user.displayName !== newDisplayName || user.photoURL !== userData.profilePicture)) {
    await updateProfile(user, { displayName: newDisplayName, photoURL: userData.profilePicture });
  }
};
