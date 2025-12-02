
'use server';

/**
 * @fileOverview An AI flow for recommending events to users.
 *
 * - recommendEvents: A function that takes a user profile and a list of all events,
 *   and returns a short, personalized list of recommended events.
 */

import { ai } from '@/ai/genkit';
import { 
    RecommendEventsInputSchema, 
    RecommendEventsOutputSchema, 
    type RecommendEventsInput, 
    type RecommendEventsOutput 
} from '@/ai/schemas/recommend-events-schema';


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
