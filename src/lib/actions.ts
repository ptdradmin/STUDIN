
'use client';

import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Firestore,
  writeBatch,
  getDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
  setDoc,
  deleteDoc,
  WriteBatch,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import type { UserProfile, Notification, Favorite } from './types';


/**
 * Gère la logique de suivi ou d'arrêt de suivi d'un utilisateur.
 *
 * @param firestore - L'instance de Firestore.
 * @param currentUserId - L'ID de l'utilisateur qui effectue l'action.
 * @param targetUserId - L'ID de l'utilisateur à suivre ou à ne plus suivre.
 * @param isCurrentlyFollowing - Un booléen indiquant si l'utilisateur actuel suit déjà l'utilisateur cible.
 */
export const toggleFollowUser = (
  firestore: Firestore,
  currentUserId: string,
  targetUserId: string,
  isCurrentlyFollowing: boolean
) => {
  if (currentUserId === targetUserId) return; 

  const currentUserRef = doc(firestore, 'users', currentUserId);
  const targetUserRef = doc(firestore, 'users', targetUserId);
  
  const batch = writeBatch(firestore);

  if (isCurrentlyFollowing) {
    batch.update(currentUserRef, { followingIds: arrayRemove(targetUserId) });
    batch.update(targetUserRef, { followerIds: arrayRemove(currentUserId) });
  } else {
    batch.update(currentUserRef, { followingIds: arrayUnion(targetUserId) });
    batch.update(targetUserRef, { followerIds: arrayUnion(currentUserId) });
  }

  // Use a non-blocking commit with a .catch() block for error handling
  batch.commit()
    .then(() => {
        if (!isCurrentlyFollowing) {
          // Create notification only on follow, this is also a non-blocking operation
          createNotification(firestore, {
              type: 'new_follower',
              senderId: currentUserId,
              recipientId: targetUserId,
              message: `a commencé à vous suivre.`
          });
        }
    })
    .catch((serverError) => {
      // Create the rich, contextual error asynchronously.
      const permissionError = new FirestorePermissionError({
        path: `users/${currentUserId} and users/${targetUserId}`,
        operation: 'update',
        requestResourceData: {
          action: isCurrentlyFollowing ? 'unfollow' : 'follow',
          currentUserId,
          targetUserId,
        },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};

/**
 * Creates a generic notification. This is a non-blocking operation.
 * @param firestore - The Firestore instance.
 * @param notifData - The notification data.
 */
export const createNotification = (
    firestore: Firestore,
    notifData: Omit<Notification, 'id' | 'createdAt' | 'read' | 'senderProfile' | 'senderId'> & { senderId: string }
) => {
    getDoc(doc(firestore, 'users', notifData.senderId)).then(senderProfileSnap => {
        if (senderProfileSnap.exists()) {
            const senderProfile = senderProfileSnap.data() as UserProfile;
            const notificationRef = doc(collection(firestore, `users/${notifData.recipientId}/notifications`));
            
            const finalNotifData = {
                id: notificationRef.id,
                ...notifData,
                senderProfile: {
                    username: senderProfile.username,
                    profilePicture: senderProfile.profilePicture,
                },
                read: false,
                createdAt: serverTimestamp(),
            };

            setDoc(notificationRef, finalNotifData).catch(error => {
                const permissionError = new FirestorePermissionError({
                    path: notificationRef.path,
                    operation: 'create',
                    requestResourceData: finalNotifData
                });
                errorEmitter.emit('permission-error', permissionError);
            });
        }
    }).catch(error => {
        // Handle error from getDoc if needed, e.g., sender profile not found.
        console.error("Failed to fetch sender profile for notification:", error);
    });
};


export const updateUserPosts = async (firestore: Firestore, userId: string, updatedProfile: Partial<Pick<UserProfile, 'username' | 'profilePicture'>>, batch: WriteBatch) => {
    const postsQuery = query(collection(firestore, 'posts'), where('userId', '==', userId));
    
    const updatedData: any = {};
    if(updatedProfile.username) updatedData.username = updatedProfile.username;
    if(updatedProfile.profilePicture) updatedData.userAvatarUrl = updatedProfile.profilePicture;

    if(Object.keys(updatedData).length === 0) {
      return; // Nothing to update
    }

    const querySnapshot = await getDocs(postsQuery);
    querySnapshot.forEach(doc => {
        const postRef = doc.ref;
        batch.update(postRef, updatedData);
    });
};

export const toggleFavorite = async (
    firestore: Firestore,
    userId: string,
    item: { id: string; type: Favorite['itemType'] },
    isCurrentlyFavorited: boolean
) => {
    const favoritesColRef = collection(firestore, `users/${userId}/favorites`);
    
    if (isCurrentlyFavorited) {
        // Un-favorite: find and delete the favorite document
        const q = query(favoritesColRef, where("itemId", "==", item.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const favDoc = querySnapshot.docs[0];
            await deleteDoc(favDoc.ref).catch((error) => {
                const permissionError = new FirestorePermissionError({
                    path: favDoc.ref.path,
                    operation: 'delete',
                });
                errorEmitter.emit('permission-error', permissionError);
                throw error;
            });
        }
    } else {
        // Favorite: add a new favorite document
        const newFavData: Omit<Favorite, 'id'> = {
            userId: userId,
            itemId: item.id,
            itemType: item.type,
            createdAt: serverTimestamp() as any,
        };
        const newDocRef = doc(favoritesColRef);
        await setDoc(newDocRef, {...newFavData, id: newDocRef.id }).catch((error) => {
            const permissionError = new FirestorePermissionError({
                path: newDocRef.path,
                operation: 'create',
                requestResourceData: newFavData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw error;
        });
    }
};
