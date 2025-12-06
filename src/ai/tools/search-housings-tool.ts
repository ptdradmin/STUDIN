
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SearchHousingsInputSchema = z.object({
    city: z.string().optional().describe('The city to search for housing in.'),
    maxPrice: z.number().optional().describe('The maximum monthly price.'),
    minBedrooms: z.number().optional().describe('The minimum number of bedrooms.'),
});
type SearchHousingsInput = z.infer<typeof SearchHousingsInputSchema>;

const HousingSchemaForTool = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string(),
  price: z.number(),
  bedrooms: z.number(),
  surfaceArea: z.number(),
  type: z.enum(['kot', 'studio', 'colocation']),
  imageUrl: z.string(),
  description: z.string(),
});
export type HousingForTool = z.infer<typeof HousingSchemaForTool>;


export const searchHousingsTool = ai.defineTool(
    {
        name: 'searchHousingsTool',
        description: 'Searches for student housing listings based on criteria. The tool cannot access the database directly, so it must return an action for the client to execute.',
        inputSchema: SearchHousingsInputSchema,
        outputSchema: z.object({
            success: z.boolean(),
            message: z.string(),
            clientAction: z.object({
                type: z.literal('SEARCH_HOUSINGS'),
                payload: SearchHousingsInputSchema
            }).optional(),
            // This allows the tool to receive the results from the client action.
            results: z.array(HousingSchemaForTool).optional().describe("A list of housing results provided by the client-side execution."),
        }),
    },
    async (input) => {
        // This tool now delegates the search to the client-side
        // to ensure security rules are respected.
        return {
            success: true,
            message: "Je recherche les logements correspondants...",
            clientAction: {
                type: 'SEARCH_HOUSINGS',
                payload: input,
            }
        };
    }
);
