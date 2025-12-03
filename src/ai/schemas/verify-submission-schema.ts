
/**
 * @fileOverview Zod schemas and TypeScript types for the verifySubmission flow.
 * This file defines the data structures for verifying challenge submissions.
 */

import { z } from 'genkit';

/**
 * Zod schema for the input of the verifySubmission function.
 */
export const VerifySubmissionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "The user's submission photo as a data URI (Base64 encoded)."
    ),
  challengeTitle: z.string().describe('The title of the challenge.'),
  challengeDescription: z
    .string()
    .describe('The detailed description of what the user needs to do.'),
});

/**
 * TypeScript type inferred from the input schema.
 */
export type VerifySubmissionInput = z.infer<typeof VerifySubmissionInputSchema>;

/**
 * Zod schema for the output of the verifySubmission function.
 */
export const VerifySubmissionOutputSchema = z.object({
  isVerified: z.boolean().describe('True if the photo validates the challenge, false otherwise.'),
  reason: z
    .string()
    .describe('A brief explanation for the verification decision.'),
});

/**
 * TypeScript type inferred from the output schema.
 */
export type VerifySubmissionOutput = z.infer<
  typeof VerifySubmissionOutputSchema
>;
