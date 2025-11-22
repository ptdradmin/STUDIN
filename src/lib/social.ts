'use client';

import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Firestore,
  writeBatch,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


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
  }

  // Exécuter le batch et gérer les erreurs de permissions
  batch.commit().catch(serverError => {
      // Emettre une erreur contextuelle pour chaque opération du batch
      const currentUserError = new FirestorePermissionError({
          path: currentUserRef.path,
          operation: 'update',
          requestResourceData: { followingIds: isCurrentlyFollowing ? `arrayRemove(${targetUserId})` : `arrayUnion(${targetUserId})` }
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', currentUserError);

      const targetUserError = new FirestorePermissionError({
          path: targetUserRef.path,
          operation: 'update',
          requestResourceData: { followerIds: isCurrentlyFollowing ? `arrayRemove(${currentUserId})` : `arrayUnion(${currentUserId})` }
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', targetUserError);
  });
};
