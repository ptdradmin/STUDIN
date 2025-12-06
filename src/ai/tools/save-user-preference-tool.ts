
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SaveUserPreferenceInputSchema = z.object({
    userId: z.string().describe("L'ID de l'utilisateur pour lequel sauvegarder la préférence."),
    key: z.string().describe("La clé de la préférence à sauvegarder (ex: 'musicTaste', 'studyField', 'housingSearch')."),
    value: z.any().describe("La valeur de la préférence."),
});
type SaveUserPreferenceInput = z.infer<typeof SaveUserPreferenceInputSchema>;

export const saveUserPreferenceTool = ai.defineTool(
    {
        name: 'saveUserPreferenceTool',
        description: "Mémorise une préférence ou une information clé sur un utilisateur pour de futures conversations. L'outil ne peut pas écrire directement dans la base de données, il doit donc retourner une action que le client exécutera.",
        inputSchema: SaveUserPreferenceInputSchema,
        outputSchema: z.object({ 
            success: z.boolean(), 
            message: z.string(),
            clientAction: z.object({
                type: z.literal('SAVE_PREFERENCE'),
                payload: SaveUserPreferenceInputSchema,
            }).optional(),
        }),
    },
    async ({ userId, key, value }) => {
        // This tool now returns a 'clientAction' object instead of writing to Firestore directly.
        // The frontend will be responsible for executing this action.
        return {
            success: true,
            message: `Je vais mémoriser cette préférence pour vous.`, // The AI can say this, but the action is on the client.
            clientAction: {
                type: 'SAVE_PREFERENCE',
                payload: {
                    userId,
                    key,
                    value,
                }
            }
        };
    }
);
