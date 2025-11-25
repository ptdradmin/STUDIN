'use server';

/**
 * @fileOverview A Genkit flow to delete a Firestore conversation and its subcollection of messages.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';

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
    // Use getFirestore() which handles initialization implicitly.
    const db = getFirestore();
    const conversationDocRef = db.doc(`conversations/${conversationId}`);

    try {
      // Use recursiveDelete for efficient and safe deletion of subcollections.
      await db.recursiveDelete(conversationDocRef);

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
