
'use client';

import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc,
    serverTimestamp,
    getDoc,
    doc,
    Firestore,
    runTransaction
} from "firebase/firestore";
import type { UserProfile } from "./types";
import { errorEmitter, FirestorePermissionError } from '@/firebase';

export const getOrCreateConversation = async (firestore: Firestore, currentUserId: string, otherUserId: string): Promise<string | null> => {
    if (currentUserId === otherUserId) return null;

    const conversationsRef = collection(firestore, 'conversations');
    // This query might fail if composite indexes are not set up, but it's a good first check.
    const q = query(conversationsRef, where('participantIds', '==', [currentUserId, otherUserId].sort()));
    
    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].id;
        }

        // If not found, try the other permutation in case sorting wasn't consistent on creation
         const qAlt = query(conversationsRef, where('participantIds', '==', [otherUserId, currentUserId].sort()));
         const altSnapshot = await getDocs(qAlt);
         if (!altSnapshot.empty) {
            return altSnapshot.docs[0].id;
        }

        // If still no conversation, create one in a transaction
        const newConversationId = await runTransaction(firestore, async (transaction) => {
            const currentUserProfileSnap = await transaction.get(doc(firestore, 'users', currentUserId));
            const otherUserProfileSnap = await transaction.get(doc(firestore, 'users', otherUserId));

            if (!currentUserProfileSnap.exists() || !otherUserProfileSnap.exists()) {
                throw new Error("User profile not found");
            }

            const currentUserProfile = currentUserProfileSnap.data() as UserProfile;
            const otherUserProfile = otherUserProfileSnap.data() as UserProfile;
            
            const newConversationData = {
                participantIds: [currentUserId, otherUserId].sort(),
                participants: {
                    [currentUserId]: {
                        username: currentUserProfile.username,
                        profilePicture: currentUserProfile.profilePicture || ''
                    },
                    [otherUserId]: {
                        username: otherUserProfile.username,
                        profilePicture: otherUserProfile.profilePicture || ''
                    }
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                unread: false,
            };

            const newDocRef = doc(collection(firestore, 'conversations'));
            transaction.set(newDocRef, newConversationData);
            return newDocRef.id;
        });

        return newConversationId;

    } catch (error: any) {
        console.error("Error in getOrCreateConversation:", error);
         if(error.code === 'permission-denied') {
             const permissionError = new FirestorePermissionError({
                path: 'conversations',
                operation: 'list', // Querying is a 'list' operation
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        return null;
    }
};
