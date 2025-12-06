
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
<<<<<<< HEAD
=======
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import type { Event } from '@/lib/types';


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
            console.error("Failed to initialize Firebase Admin SDK for event search:", e);
        }
    }
}
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4

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
            results: z.array(EventSchemaForTool).optional().describe("A list of event results provided by the client-side execution."),
        }),
    },
<<<<<<< HEAD
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
=======
    async (input: SearchEventsInput) => {
        initializeAdminApp();
        if (!adminApp) {
            console.error("Firebase Admin SDK not initialized. Cannot search events.");
            return [];
        }

        const db = getFirestore(adminApp);
        let query: FirebaseFirestore.Query = db.collection('events');

        if (input.city) {
            query = query.where('city', '==', input.city);
        }
        if (input.category) {
            query = query.where('category', '==', input.category);
        }

        // Filter for future events
        query = query.where('startDate', '>=', new Date());
        query = query.orderBy('startDate', 'asc');


        const snapshot = await query.limit(3).get();
        if (snapshot.empty) {
            return [];
        }

        const results: EventForTool[] = [];
        snapshot.forEach(doc => {
            const data = doc.data() as Event;
            results.push({
                id: data.id,
                title: data.title,
                city: data.city,
                startDate: data.startDate,
                category: data.category,
                price: data.price,
                imageUrl: data.imageUrl,
            });
        });

        return results;
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4
    }
);
