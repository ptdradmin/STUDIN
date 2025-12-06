
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SearchEventsInputSchema = z.object({
    city: z.string().optional().describe('La ville où chercher des événements.'),
    category: z.enum(['soirée', 'conférence', 'sport', 'culture']).optional().describe("La catégorie de l'événement."),
});

const EventSchemaForTool = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string(),
  startDate: z.any(),
  category: z.string(),
  price: z.number(),
  imageUrl: z.string(),
});
export type EventForTool = z.infer<typeof EventSchemaForTool>;

export const searchEventsTool = ai.defineTool(
    {
        name: 'searchEventsTool',
        description: "Recherche des événements étudiants en fonction de critères. L'outil ne peut pas accéder directement à la base de données, il doit donc retourner une action que le client exécutera.",
        inputSchema: SearchEventsInputSchema,
        outputSchema: z.object({
            success: z.boolean(),
            message: z.string(),
            clientAction: z.object({
                type: z.literal('SEARCH_EVENTS'),
                payload: SearchEventsInputSchema,
            }).optional(),
        }),
    },
    async (input) => {
        // This tool now delegates the search to the client-side
        // to ensure security rules are respected.
        return {
            success: true,
            message: "Je recherche les événements correspondants...",
            clientAction: {
                type: 'SEARCH_EVENTS',
                payload: input,
            }
        };
    }
);
