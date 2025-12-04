
'use server';
/**
 * @fileOverview An AI flow for generating a post caption based on an image.
 *
 * - generateCaption: A function that takes an image and returns a suggested caption.
 * - GenerateCaptionInput: The input type for the generateCaption function.
 * - GenerateCaptionOutput: The return type for the generateCaption function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCaptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate a caption for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateCaptionInput = z.infer<typeof GenerateCaptionInputSchema>;

const GenerateCaptionOutputSchema = z.object({
  caption: z.string().describe('The generated caption for the post.'),
});
export type GenerateCaptionOutput = z.infer<typeof GenerateCaptionOutputSchema>;

export async function generateCaption(input: GenerateCaptionInput): Promise<GenerateCaptionOutput> {
  return generateCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCaptionPrompt',
  input: { schema: GenerateCaptionInputSchema },
  output: { schema: GenerateCaptionOutputSchema },
  prompt: `You are a creative assistant for a student social media platform. Your task is to generate a short, engaging, and creative caption for a user's post based on the provided image. The caption should be in French.

Keep it concise, add relevant emojis, and use a friendly and casual tone suitable for students.

Image: {{media url=photoDataUri}}`,
});

const generateCaptionFlow = ai.defineFlow(
  {
    name: 'generateCaptionFlow',
    inputSchema: GenerateCaptionInputSchema,
    outputSchema: GenerateCaptionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
