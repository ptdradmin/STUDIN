
'use server';

/**
 * @fileOverview An AI flow for recommending events to users.
 *
 * - recommendEvents: A function that takes a user profile and a list of all events,
 *   and returns a short, personalized list of recommended events.
 * - RecommendEventsInput: The input type for the recommendEvents function.
 * - RecommendEventsOutput: The return type for the recommendEvents function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Event, UserProfile } from '@/lib/types';

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
    startDate: z.string(),
    endDate: z.string(),
    locationName: z.string(),
    address: z.string(),
    city: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    price: z.number(),
    imageUrl: z.string(),
    imageHint: z.string(),
    coordinates: z.tuple([z.number(), z.number()]),
    createdAt: z.any(),
    updatedAt: z.any(),
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
  followerIds: z.array(z.string()),
  followingIds: z.array(z.string()),
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

export async function recommendEvents(input: RecommendEventsInput): Promise<RecommendEventsOutput> {
  return recommendEventsFlow(input);
}


const recommendationPrompt = ai.definePrompt({
  name: 'recommendEventsPrompt',
  input: { schema: RecommendEventsInputSchema },
  output: { schema: RecommendEventsOutputSchema },
  prompt: `You are a helpful assistant for a student-focused platform called STUD'IN. Your task is to recommend relevant events to a user based on their profile and the list of all available events.

Return a JSON array of exactly 3 event objects that are the best match for the user.

Consider the following criteria for your recommendations, in order of importance:
1.  **City:** Prioritize events in the user's city.
2.  **University:** Prioritize events happening at or related to the user's university.
3.  **Field of Study & Category:** Try to match the event category with the user's field of study (e.g., 'conférence' for academic fields, 'sport' for sports-related studies, 'soirée' for everyone).
4.  **Recency:** Prefer newer events.

Here is the user's profile:
\`\`\`json
{{{jsonEncode userProfile}}}
\`\`\`

Here is the list of all available events:
\`\`\`json
{{{jsonEncode allEvents}}}
\`\`\`

Based on this information, provide a JSON array of the top 3 recommended events for this user.`,
});

const recommendEventsFlow = ai.defineFlow(
  {
    name: 'recommendEventsFlow',
    inputSchema: RecommendEventsInputSchema,
    outputSchema: RecommendEventsOutputSchema,
  },
  async (input) => {
    // Filter out past events before sending to the model
    const futureEvents = input.allEvents.filter(event => new Date(event.startDate) > new Date());
    
    if (futureEvents.length === 0) {
        return [];
    }

    const { output } = await recommendationPrompt({ ...input, allEvents: futureEvents });
    return output || [];
  }
);
