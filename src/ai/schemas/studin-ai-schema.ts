
/**
 * @fileOverview Zod schemas and TypeScript types for the studinAiFlow.
 * This file separates data definitions from server-side logic.
 */

import { z } from 'genkit';

const StudinAiMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string().optional(),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
});
export type StudinAiMessage = z.infer<typeof StudinAiMessageSchema>;

export const StudinAiInputSchema = z.object({
  history: z.array(StudinAiMessageSchema).optional().describe('The conversation history.'),
  message: StudinAiMessageSchema.describe('The new user message.'),
  isPro: z.boolean().optional().describe('Flag to use the Pro model.'),
});
export type StudinAiInput = z.infer<typeof StudinAiInputSchema>;


export const StudinAiOutputSchema = z.object({
  text: z.string().describe("The AI's text response."),
  audio: z.string().optional().describe("The AI's audio response as a dataURI."),
  imageUrl: z.string().optional().describe("A generated image URL as a data URI."),
});
export type StudinAiOutput = z.infer<typeof StudinAiOutputSchema>;
