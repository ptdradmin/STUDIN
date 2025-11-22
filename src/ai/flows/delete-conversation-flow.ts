
'use server';

/**
 * @fileOverview A Genkit flow to delete a Firestore conversation and its subcollection of messages.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK only if it hasn't been initialized yet.
if (!getApps().length) {
    initializeApp();
}

const DeleteConversationInputSchema = z.string().describe("The ID of the conversation to delete.");
export type DeleteConversationInput = z.infer<typeof DeleteConversationInputSchema>;

const DeleteConversationOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteConversationOutput = z.infer<typeof DeleteConversationOutputSchema>;


/**
 * Deletes a conversation and all its messages.
 * This is a wrapper function that invokes the Genkit flow.
 * @param input - The ID of the conversation to delete.
 * @returns A promise that resolves to the output of the flow.
 */
export async function deleteConversation(input: DeleteConversationInput): Promise<DeleteConversationOutput> {
  return deleteConversationFlow(input);
}

const deleteConversationFlow = ai.defineFlow(
  {
    name: 'deleteConversationFlow',
    inputSchema: DeleteConversationInputSchema,
    outputSchema: DeleteConversationOutputSchema,
  },
  async (conversationId) => {
    const db = getFirestore();
    const batchSize = 100;

    const collectionRef = db.collection(`conversations/${conversationId}/messages`);
    
    try {
        // Delete the messages subcollection in batches
        let query = collectionRef.limit(batchSize);
        while (true) {
            const snapshot = await query.get();
            if (snapshot.size === 0) {
                break;
            }

            const batch = db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        // After deleting the subcollection, delete the parent conversation document
        const conversationRef = db.doc(`conversations/${conversationId}`);
        await conversationRef.delete();

        return {
            success: true,
            message: `Successfully deleted conversation ${conversationId} and all its messages.`,
        };

    } catch (error: any) {
        console.error("Error deleting conversation: ", error);
        return {
            success: false,
            message: `Failed to delete conversation: ${error.message}`
        }
    }
  }
);
