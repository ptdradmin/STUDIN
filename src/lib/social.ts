'use client';

import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Firestore,
} from 'firebase/firestore';

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

  try {
    if (isCurrentlyFollowing) {
      // Ne plus suivre : retirer les IDs des listes respectives
      await updateDoc(currentUserRef, {
        followingIds: arrayRemove(targetUserId),
      });
      await updateDoc(targetUserRef, {
        followerIds: arrayRemove(currentUserId),
      });
    } else {
      // Suivre : ajouter les IDs aux listes respectives
      await updateDoc(currentUserRef, {
        followingIds: arrayUnion(targetUserId),
      });
      await updateDoc(targetUserRef, {
        followerIds: arrayUnion(currentUserId),
      });
    }
  } catch (error) {
    console.error('Error toggling follow state:', error);
    // Dans une application réelle, vous pourriez vouloir gérer cette erreur plus finement.
    throw new Error("Impossible de mettre à jour le statut de suivi.");
  }
};
