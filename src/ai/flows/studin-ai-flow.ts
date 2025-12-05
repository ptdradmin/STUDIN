'use server';

/**
 * @fileOverview A conversational AI flow for STUD'IN AI.
 * This flow powers the main AI assistant of the application.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudinAiInputSchema = z.object({
  message: z.string().describe('The user\'s message to the AI.'),
});
export type StudinAiInput = z.infer<typeof StudinAiInputSchema>;

const StudinAiOutputSchema = z.object({
  response: z.string().describe("The AI's response."),
});
export type StudinAiOutput = z.infer<typeof StudinAiOutputSchema>;

export async function askStudinAi(input: StudinAiInput): Promise<StudinAiOutput> {
  return studinAiFlow(input);
}

const studinAiPrompt = ai.definePrompt({
  name: 'studinAiPrompt',
  input: { schema: StudinAiInputSchema },
  output: { schema: StudinAiOutputSchema },
  prompt: `You are STUD'IN AI, a helpful, friendly, and knowledgeable AI assistant for students on the STUD'IN platform. Your goal is to assist students with their questions about university life, studies, housing, carpooling, events, and well-being.
  
  Your personality is:
  - Encouraging and positive.
  - Knowledgeable about student life in Belgium.
  - A bit informal, using emojis where appropriate to be friendly.
  - Always identify yourself as STUD'IN AI, not Gemini.

  User's message:
  "{{{message}}}"

  Your response:
  `,
});

const studinAiFlow = ai.defineFlow(
  {
    name: 'studinAiFlow',
    inputSchema: StudinAiInputSchema,
    outputSchema: StudinAiOutputSchema,
  },
  async ({ message }) => {
    const { output } = await studinAiPrompt({ message });
    return output!;
  }
);
