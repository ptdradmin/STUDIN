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
    Firestore
} from "firebase/firestore";
import type { UserProfile } from "./types";

export const getOrCreateConversation = async (firestore: Firestore, currentUserId: string, otherUserId: string): Promise<string | null> => {
    if (currentUserId === otherUserId) return null;

    const conversationsRef = collection(firestore, 'conversations');

    // Query to find an existing conversation between the two users
    const q = query(conversationsRef, 
        where('participantIds', 'array-contains', currentUserId)
    );

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

        // If no conversation exists, create a new one
        const currentUserProfileSnap = await getDoc(doc(firestore, 'users', currentUserId));
        const otherUserProfileSnap = await getDoc(doc(firestore, 'users', otherUserId));

        if (!currentUserProfileSnap.exists() || !otherUserProfileSnap.exists()) {
            throw new Error("User profile not found");
        }

        const currentUserProfile = currentUserProfileSnap.data() as UserProfile;
        const otherUserProfile = otherUserProfileSnap.data() as UserProfile;

        const newConversation = {
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

        const docRef = await addDoc(conversationsRef, newConversation);
        return docRef.id;

    } catch (error) {
        console.error("Error getting or creating conversation: ", error);
        return null;
    }
};
