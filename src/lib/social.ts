
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
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { addDoc } from 'firebase/firestore';
import type { UserProfile } from './types';


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
  if (currentUserId === targetUserId) return; // Un utilisateur ne peut pas se suivre lui-même

  const currentUserRef = doc(firestore, 'users', currentUserId);
  const targetUserRef = doc(firestore, 'users', targetUserId);
  
  const batch = writeBatch(firestore);

  if (isCurrentlyFollowing) {
    // Ne plus suivre : retirer les IDs des listes respectives
    batch.update(currentUserRef, { followingIds: arrayRemove(targetUserId) });
    batch.update(targetUserRef, { followerIds: arrayRemove(currentUserId) });
  } else {
    // Suivre : ajouter les IDs aux listes respectives
    batch.update(currentUserRef, { followingIds: arrayUnion(targetUserId) });
    batch.update(targetUserRef, { followerIds: arrayUnion(currentUserId) });

    // Créer une notification pour l'utilisateur suivi
    const senderProfileSnap = await getDoc(currentUserRef);
    if(senderProfileSnap.exists()) {
        const senderProfile = senderProfileSnap.data();
        const notificationRef = doc(collection(firestore, `users/${targetUserId}/notifications`));
        
        batch.set(notificationRef, {
            id: notificationRef.id,
            type: 'new_follower',
            senderId: currentUserId,
            senderProfile: {
                username: senderProfile.username,
                profilePicture: senderProfile.profilePicture,
            },
            recipientId: targetUserId,
            read: false,
            createdAt: serverTimestamp(),
        });
    }
  }

  // Exécuter le batch et gérer les erreurs de permissions
  try {
    await batch.commit();
  } catch (serverError) {
    // Si le batch échoue, émettre une erreur contextuelle pour le débogage
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
    // Afficher l'erreur dans la console pour un débogage immédiat
    console.error("Erreur de permission lors de la tentative de suivi/non-suivi :", serverError);
  }
};


export const updateUserPosts = async (firestore: Firestore, userId: string, updatedProfile: Partial<UserProfile>) => {
    const postsQuery = query(collection(firestore, 'posts'), where('userId', '==', userId));
    const batch = writeBatch(firestore);
    
    const postsToUpdate: { path: string; data: any }[] = [];

    try {
        const querySnapshot = await getDocs(postsQuery);
        querySnapshot.forEach(doc => {
            const postRef = doc.ref;
            const updatedData = {
                userDisplayName: updatedProfile.username,
                userAvatarUrl: updatedProfile.profilePicture,
            };
            batch.update(postRef, updatedData);
            postsToUpdate.push({ path: postRef.path, data: updatedData });
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
        console.error("Erreur de permission lors de la mise à jour des publications :", serverError);
    }
};

