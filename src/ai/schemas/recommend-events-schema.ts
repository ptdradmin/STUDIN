
/**
 * @fileOverview Zod schemas and TypeScript types for the recommendEvents flow.
 * This file separates data definitions from server-side logic to comply with
 * "use server" module constraints.
 *
 * - RecommendEventsInputSchema: Zod schema for the input of the recommendEvents function.
 * - RecommendEventsInput: TypeScript type for the input.
 * - RecommendEventsOutputSchema: Zod schema for the output of the recommendEvents function.
 * - RecommendEventsOutput: TypeScript type for the output.
 */

import { z } from 'genkit';

// Define the Zod schema for a single Event.
// This should match the `Event` type in `src/lib/types.ts`.
const EventSchema = z.object({
  id: z.string(),
  organizerId: z.string(),
  username: z.string(),
  userAvatarUrl: z.string().optional(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['soirée', 'conférence', 'sport', 'culture']),
  startDate: z.any().describe('The start date of the event as a Firestore Timestamp.'),
  endDate: z.any().describe('The end date of the event as a Firestore Timestamp.'),
  locationName: z.string(),
  address: z.string(),
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  price: z.number(),
  imageUrl: z.string(),
  imageHint: z.string(),
  coordinates: z.tuple([z.number(), z.number()]),
  createdAt: z.any().describe('The creation date of the event as a Firestore Timestamp.'),
  updatedAt: z.any().describe('The last update date of the event as a Firestore Timestamp.'),
  university: z.string().optional(),
  maxAttendees: z.number().optional(),
  attendeeIds: z.array(z.string()).optional(),
});

// Define the Zod schema for the UserProfile.
// This should match the `UserProfile` type in `src/lib/types.ts`.
const UserProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.enum(['student', 'institution', 'admin']),
  firstName: z.string(),
  lastName: z.string(),
  university: z.string(),
  fieldOfStudy: z.string(),
  postalCode: z.string(),
  city: z.string(),
  bio: z.string(),
  website: z.string().optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
  profilePicture: z.string(),
  isVerified: z.boolean().optional(),
  isPro: z.boolean().optional(),
  followerIds: z.array(z.string()),
  followingIds: z.array(z.string()),
  points: z.number().optional(),
  challengesCompleted: z.number().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
});


export const RecommendEventsInputSchema = z.object({
  userProfile: UserProfileSchema.describe("The profile of the user for whom to recommend events."),
  allEvents: z.array(EventSchema).describe("A list of all available events."),
});
export type RecommendEventsInput = z.infer<typeof RecommendEventsInputSchema>;


export const RecommendEventsOutputSchema = z.array(EventSchema).describe("A list of 3 recommended events.");
export type RecommendEventsOutput = z.infer<typeof RecommendEventsOutputSchema>;
