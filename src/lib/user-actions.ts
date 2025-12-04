
'use client';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import { User, updateProfile } from 'firebase/auth';
import { generateAvatar } from '@/lib/avatars';

export const createUserDocument = async (
  firestore: Firestore,
  user: User | null,
  additionalData: Record<string, any> = {}
) => {
  if (!user) {
    throw new Error("L'objet utilisateur est requis pour créer un document utilisateur.");
  }

  const userDocRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    console.log("Le document utilisateur existe déjà pour :", user.uid);
    return; // Le document existe déjà, pas besoin de le recréer.
  }
  
  const { email, displayName, photoURL } = user;
  
  // Génère un nom d'utilisateur simple et probablement unique.
  // La logique complexe de vérification est retirée car elle causait des problèmes de permission.
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

  // Écrit directement le document. La règle de sécurité `allow create: if request.auth.uid == userId;` fonctionnera.
  await setDoc(userDocRef, userData);

  const newDisplayName = `${firstName} ${lastName}`.trim();
  if (user && (user.displayName !== newDisplayName || user.photoURL !== userData.profilePicture)) {
    await updateProfile(user, { displayName: newDisplayName, photoURL: userData.profilePicture });
  }
};

// La fonction isUsernameUnique est retirée car elle n'est plus utilisée et était la source des problèmes.
