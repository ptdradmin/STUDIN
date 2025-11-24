
'use server';

/**
 * @fileOverview A Genkit flow to delete a Firestore conversation and its subcollection of messages.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, query, getDocs, writeBatch, doc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

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
    // This flow should run in a server environment where Admin SDK is initialized.
    // However, to make it work with client-side SDK if needed, we get the instance.
    // Note: This pattern is unusual. Genkit flows are typically pure backend logic.
    const { firestore: db } = initializeFirebase();

    const messagesCollectionRef = collection(db, `conversations/${conversationId}/messages`);
    const conversationDocRef = doc(db, 'conversations', conversationId);

    try {
        // Get all messages to delete
        const messagesSnapshot = await getDocs(messagesCollectionRef);
        
        // Use a batch to delete all messages
        const batch = writeBatch(db);
        messagesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Finally, delete the conversation document itself
        batch.delete(conversationDocRef);
        
        await batch.commit();

        return {
            success: true,
            message: `Successfully deleted conversation ${conversationId} and all its messages.`,
        };

    } catch (error: any) {
        console.error("Error deleting conversation: ", error);
        // In a real scenario, you'd want to handle permissions errors more gracefully.
        return {
            success: false,
            message: `Failed to delete conversation: ${error.message}`
        }
    }
  }
);
