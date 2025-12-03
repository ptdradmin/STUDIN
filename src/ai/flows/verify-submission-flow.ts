
'use server';

/**
 * @fileOverview A Genkit flow for verifying if a user's submission photo
 * matches the requirements of a specific challenge.
 *
 * This flow uses a structured prompt to ask the AI model to act as a judge.
 *
 * - verifySubmission: An exported function that can be called from the application
 *   to trigger the verification process.
 * - VerifySubmissionInput: The TypeScript type for the input data.
 * - VerifySubmissionOutput: The TypeScript type for the verification result.
 */

import { ai } from '@/ai/genkit';
import {
  VerifySubmissionInputSchema,
  VerifySubmissionOutputSchema,
  type VerifySubmissionInput,
  type VerifySubmissionOutput,
} from '@/ai/schemas/verify-submission-schema';

/**
 * Verifies if a user's submission photo correctly fulfills a given challenge.
 *
 * @param input - An object containing the photo and challenge details.
 * @returns A promise that resolves to the verification result from the AI.
 */
export async function verifySubmission(
  input: VerifySubmissionInput
): Promise<VerifySubmissionOutput> {
  return await verifySubmissionFlow(input);
}

// 1. Define the AI prompt with structured input and output.
const verificationPrompt = ai.definePrompt({
  name: 'verifySubmissionPrompt',
  input: { schema: VerifySubmissionInputSchema },
  output: { schema: VerifySubmissionOutputSchema },
  prompt: `You are an AI judge for a city exploration game called STUD'IN. Your task is to determine if a user's submitted photo correctly completes a specific challenge.

Analyze the user's photo and the challenge's requirements carefully.

**Challenge Details:**
- **Title:** {{{challengeTitle}}}
- **Description:** {{{challengeDescription}}}

**User's Submission:**
- **Photo:** {{media url=photoDataUri}}

**Your Task:**
Based on the challenge details, evaluate if the submitted photo is a valid proof of completion.
- If the photo clearly and unambiguously proves the challenge was completed, set 'isVerified' to true.
- If the photo does not match the challenge description, is unclear, or does not provide enough evidence, set 'isVerified' to false.

Provide a brief 'reason' for your decision (e.g., "The photo clearly shows the 'Manneken Pis' statue as required." or "The photo is of a park, but not the correct one specified in the challenge.").`,
});

// 2. Define the flow that orchestrates the verification process.
const verifySubmissionFlow = ai.defineFlow(
  {
    name: 'verifySubmissionFlow',
    inputSchema: VerifySubmissionInputSchema,
    outputSchema: VerifySubmissionOutputSchema,
  },
  async (input) => {
    const { output } = await verificationPrompt(input);
    return output!;
  }
);
