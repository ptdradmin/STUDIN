'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, credential } from 'firebase-admin/app';
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

const SearchEventsInputSchema = z.object({
    city: z.string().optional().describe('La ville où chercher des événements.'),
    category: z.enum(['soirée', 'conférence', 'sport', 'culture']).optional().describe("La catégorie de l'événement."),
});
type SearchEventsInput = z.infer<typeof SearchEventsInputSchema>;

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
        description: "Recherche des événements étudiants en fonction de critères. Utilise cet outil lorsqu'un utilisateur demande quoi faire, cherche une soirée, une conférence, etc.",
        inputSchema: SearchEventsInputSchema,
        outputSchema: z.array(EventSchemaForTool),
    },
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
    }
);
