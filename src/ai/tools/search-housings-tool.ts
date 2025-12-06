
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
<<<<<<< HEAD
=======
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import type { Housing } from '@/lib/types';


let adminApp: App | null = null;

function initializeAdminApp() {
    if (getApps().length > 0) {
        adminApp = getApps()[0];
        return;
    }
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_STUD_IN_A033B;
    if (serviceAccountString) {
        try {
            const serviceAccount = JSON.parse(serviceAccountString);
            adminApp = initializeApp({
                credential: credential.cert(serviceAccount)
            });
        } catch (e) {
            console.error("Failed to initialize Firebase Admin SDK:", e);
        }
    }
}

>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4

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
<<<<<<< HEAD
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
=======
        description: 'Searches for student housing listings based on criteria. Use this tool when a user asks to find housing, kots, studios, or colocations.',
        inputSchema: SearchHousingsInputSchema,
        outputSchema: z.array(HousingSchemaForTool),
    },
    async (input: SearchHousingsInput) => {
        initializeAdminApp();
        if (!adminApp) {
            console.error("Firebase Admin SDK not initialized. Cannot perform search.");
            return [];
        }

        const db = getFirestore(adminApp);
        let query: FirebaseFirestore.Query = db.collection('housings');

        if (input.city) {
            query = query.where('city', '==', input.city);
        }
        if (input.maxPrice) {
            query = query.where('price', '<=', input.maxPrice);
        }
        if (input.minBedrooms) {
            query = query.where('bedrooms', '>=', input.minBedrooms);
        }

        const snapshot = await query.limit(3).get();
        if (snapshot.empty) {
            return [];
        }

        const results: HousingForTool[] = [];
        snapshot.forEach(doc => {
            const data = doc.data() as Housing; // Cast to your full Housing type
            results.push({
                id: data.id,
                title: data.title,
                city: data.city,
                price: data.price,
                bedrooms: data.bedrooms,
                surfaceArea: data.surfaceArea,
                type: data.type,
                imageUrl: data.imageUrl,
                description: data.description,
            });
        });

        return results;
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4
    }
);
