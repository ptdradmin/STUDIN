/**
 * @fileOverview Zod schemas and TypeScript types for the studinAiFlow.
 * This file separates data definitions from server-side logic.
 */

import { z } from 'genkit';

// Simplified UserProfile schema for injection into the AI prompt
const AiUserProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  university: z.string(),
  fieldOfStudy: z.string(),
  city: z.string(),
  bio: z.string(),
  isPro: z.boolean().optional(),
  aiPreferences: z.record(z.any()).optional().describe("A key-value store for user's long-term preferences."),
});
export type AiUserProfile = z.infer<typeof AiUserProfileSchema>;


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
  userProfile: AiUserProfileSchema.optional().describe('The profile of the current user to provide context.'),
});
export type StudinAiInput = z.infer<typeof StudinAiInputSchema>;


export const StudinAiOutputSchema = z.object({
  text: z.string().optional().describe("The AI's text response."),
  audio: z.string().optional().describe("The AI's audio response as a dataURI."),
  imageUrl: z.string().optional().describe("A generated image URL as a data URI."),
  toolData: z.any().optional().describe("Data returned from any tools the AI used."),
});
export type StudinAiOutput = z.infer<typeof StudinAiOutputSchema>;

    
    