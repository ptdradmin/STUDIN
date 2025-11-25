
'use server';

/**
 * @fileOverview A Genkit flow to delete a Firestore conversation and its subcollection of messages.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as admin from 'firebase-admin';

const DeleteConversationInputSchema = z.string().describe("The ID of the conversation to delete.");
export type DeleteConversationInput = z.infer<typeof DeleteConversationInputSchema>;

const DeleteConversationOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteConversationOutput = z.infer<typeof DeleteConversationOutputSchema>;

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

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
    const db = admin.firestore();
    const messagesCollectionRef = db.collection(`conversations/${conversationId}/messages`);
    const conversationDocRef = db.doc(`conversations/${conversationId}`);

    try {
      // Get all messages to delete
      const messagesSnapshot = await messagesCollectionRef.get();
        
      // Use a batch to delete all messages
      const batch = db.batch();
      messagesSnapshot.docs.forEach(doc => {
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
        return {
            success: false,
            message: `Failed to delete conversation: ${error.message}`
        }
    }
  }
);
