'use server';
/**
 * @fileOverview An AI flow for generating a post caption based on an image and user profile.
 *
 * - generateCaption: A function that takes an image and user profile, and returns a suggested caption.
 * - GenerateCaptionInput: The input type for the generateCaption function.
 * - GenerateCaptionOutput: The return type for the generateCaption function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const UserProfileSchema = z.object({
  username: z.string(),
  university: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  bio: z.string().optional(),
}).describe("A simplified user profile.");


const GenerateCaptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to generate a caption for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userProfile: UserProfileSchema.optional().describe("The profile of the user making the post."),
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
  prompt: `You are a creative social media assistant for a student platform called STUD'IN.
Your task is to generate a short, engaging, and creative caption for a user's post based on the provided image and their profile.
The caption should be in French.

Use a friendly and casual tone suitable for students.
Keep it concise, add relevant emojis, and if the user profile is available, try to subtly reflect their personality, field of study, or university.

**User Profile:**
{{#if userProfile}}
- Username: {{{userProfile.username}}}
- University: {{{userProfile.university}}}
- Field of Study: {{{userProfile.fieldOfStudy}}}
- Bio: {{{userProfile.bio}}}
{{else}}
- No profile provided.
{{/if}}

**Image to caption:**
{{media url=photoDataUri}}

Generate a creative caption now.`,
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