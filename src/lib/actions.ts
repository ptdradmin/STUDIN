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
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import type { UserProfile, Notification } from './types';


/**
 * Gère la logique de suivi ou d'arrêt de suivi d'un utilisateur.
 *
 * @param firestore - L'instance de Firestore.
 * @param currentUserId - L'ID de l'utilisateur qui effectue l'action.
 * @param targetUserId - L'ID de l'utilisateur à suivre ou à ne plus suivre.
 * @param isCurrentlyFollowing - Un booléen indiquant si l'utilisateur actuel suit déjà l'utilisateur cible.
 */
export const toggleFollowUser = async (
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

  try {
    await batch.commit();
    if (!isCurrentlyFollowing) {
        await createNotification(firestore, {
            type: 'new_follower',
            senderId: currentUserId,
            recipientId: targetUserId,
            message: `a commencé à vous suivre.`
        });
    }
  } catch (serverError) {
    const permissionError = new FirestorePermissionError({
        path: `users/${currentUserId} and users/${targetUserId}`,
        operation: 'update',
        requestResourceData: { 
            action: isCurrentlyFollowing ? 'unfollow' : 'follow',
            currentUserId,
            targetUserId 
        }
    } satisfies SecurityRuleContext);
    errorEmitter.emit('permission-error', permissionError);
    // Je retire le throw pour m'assurer que seul l'emitter est utilisé
  }
};

/**
 * Creates a generic notification.
 * @param firestore - The Firestore instance.
 * @param notifData - The notification data.
 */
export const createNotification = async (
    firestore: Firestore,
    notifData: Omit<Notification, 'id' | 'createdAt' | 'read' | 'senderProfile'>
) => {
    try {
        const senderProfileSnap = await getDoc(doc(firestore, 'users', notifData.senderId));
        if (senderProfileSnap.exists()) {
            const senderProfile = senderProfileSnap.data() as UserProfile;
            const notificationRef = collection(firestore, `users/${notifData.recipientId}/notifications`);
            
            const finalNotifData = {
                ...notifData,
                senderProfile: {
                    username: senderProfile.username,
                    profilePicture: senderProfile.profilePicture,
                },
                read: false,
                createdAt: serverTimestamp(),
            };
            
            const docRef = doc(notificationRef);

            await setDoc(docRef, { ...finalNotifData, id: docRef.id });

        }
    } catch (serverError) {
        const permissionError = new FirestorePermissionError({
            path: `users/${notifData.recipientId}/notifications`,
            operation: 'create',
            requestResourceData: notifData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        console.error(`Erreur lors de la création de la notification de type ${notifData.type}:`, serverError);
        throw serverError;
    }
};


export const updateUserPosts = async (firestore: Firestore, userId: string, updatedProfile: Partial<Pick<UserProfile, 'username' | 'profilePicture'>>) => {
    const postsQuery = query(collection(firestore, 'posts'), where('userId', '==', userId));
    const batch = writeBatch(firestore);
    
    const postsToUpdate: { path: string; data: any }[] = [];

    try {
        const querySnapshot = await getDocs(postsQuery);
        querySnapshot.forEach(doc => {
            const postRef = doc.ref;
            const updatedData: any = {};
            if(updatedProfile.username) updatedData.userDisplayName = updatedProfile.username;
            if(updatedProfile.profilePicture) updatedData.userAvatarUrl = updatedProfile.profilePicture;
            
            if(Object.keys(updatedData).length > 0) {
              batch.update(postRef, updatedData);
              postsToUpdate.push({ path: postRef.path, data: updatedData });
            }
        });
        await batch.commit();
    } catch (serverError) {
         const permissionError = new FirestorePermissionError({
            path: `posts (pour l'utilisateur ${userId})`,
            operation: 'update',
            requestResourceData: { 
                note: 'Tentative de mise à jour de plusieurs publications après la mise à jour du profil.',
                updatedData: updatedProfile,
                postsPaths: postsToUpdate.map(p => p.path),
            }
        } satisfies SecurityRuleContext);

        errorEmitter.emit('permission-error', permissionError);
        // We re-throw the original error to let the caller know something went wrong.
        throw serverError;
    }
};
