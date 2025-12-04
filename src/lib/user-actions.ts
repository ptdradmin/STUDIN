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
  user: User | null,
  additionalData: Record<string, any> = {}
) => {

  if (additionalData.checkUsername && !user) {
    return isUsernameUnique(firestore, additionalData.checkUsername);
  }

  if (!user) {
    throw new Error("User object is required to create a user document.");
  }

  const userDocRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return; // User document already exists
  }

  // --- Start of Critical Section for Username Generation ---
  let username = '';
  if (additionalData.username) {
      const isUnique = await isUsernameUnique(firestore, additionalData.username);
      if (!isUnique) {
          throw new Error('Username is already taken.');
      }
      username = additionalData.username;
  } else {
      let base = (user.email?.split('@')[0] || `user${user.uid.substring(0, 6)}`).toLowerCase().replace(/[^a-z0-9_.]/g, '');
      let isUnique = false;
      let counter = 1;
      username = base;
      while(!isUnique) {
          isUnique = await isUsernameUnique(firestore, username);
          if (!isUnique) {
              username = `${base}${counter}`;
              counter++;
          }
      }
  }
  // --- End of Critical Section ---

  const { email, displayName, photoURL } = user;
  const [firstNameFromProvider, lastNameFromProvider] = displayName?.split(' ') || ['', ''];

  const firstName = additionalData.firstName || firstNameFromProvider || '';
  const lastName = additionalData.lastName || lastNameFromProvider || '';
  
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
    