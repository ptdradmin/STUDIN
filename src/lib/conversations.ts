
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
    const q = query(conversationsRef, where('participantIds', 'array-contains', currentUserId));

    try {
        const querySnapshot = await getDocs(q);
        let existingConversationId: string | null = null;
        
        querySnapshot.forEach(doc => {
            const conversation = doc.data();
            if (conversation.participantIds.includes(otherUserId)) {
                existingConversationId = doc.id;
            }
        });
        
        if (existingConversationId) {
            return existingConversationId;
        }

        // Use a transaction to create the conversation atomically
        const newConversationId = await runTransaction(firestore, async (transaction) => {
            const currentUserProfileSnap = await transaction.get(doc(firestore, 'users', currentUserId));
            const otherUserProfileSnap = await transaction.get(doc(firestore, 'users', otherUserId));

            if (!currentUserProfileSnap.exists() || !otherUserProfileSnap.exists()) {
                throw new Error("User profile not found");
            }

            const currentUserProfile = currentUserProfileSnap.data() as UserProfile;
            const otherUserProfile = otherUserProfileSnap.data() as UserProfile;
            
            const newConversationData = {
                participantIds: [currentUserId, otherUserId],
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
            };

            const newDocRef = doc(collection(firestore, 'conversations'));
            transaction.set(newDocRef, newConversationData);
            return newDocRef.id;
        });

        return newConversationId;

    } catch (error: any) {
        console.error("Error in getOrCreateConversation transaction:", error);
         if(error.code === 'permission-denied') {
             const permissionError = new FirestorePermissionError({
                path: 'conversations',
                operation: 'create',
                requestResourceData: { participantIds: [currentUserId, otherUserId] }
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        return null;
    }
};
