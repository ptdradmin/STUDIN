'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, credential } from 'firebase-admin/app';

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
            console.error("Failed to initialize Firebase Admin SDK for user preferences:", e);
        }
    }
}

const SaveUserPreferenceInputSchema = z.object({
    userId: z.string().describe("L'ID de l'utilisateur pour lequel sauvegarder la préférence."),
    key: z.string().describe("La clé de la préférence à sauvegarder (ex: 'musicTaste', 'studyField', 'housingSearch')."),
    value: z.any().describe("La valeur de la préférence."),
});
type SaveUserPreferenceInput = z.infer<typeof SaveUserPreferenceInputSchema>;

export const saveUserPreferenceTool = ai.defineTool(
    {
        name: 'saveUserPreferenceTool',
        description: "Mémorise une préférence ou une information clé sur un utilisateur pour de futures conversations. Utilise cet outil lorsqu'un utilisateur exprime un goût, un besoin récurrent ou une information personnelle pertinente.",
        inputSchema: SaveUserPreferenceInputSchema,
        outputSchema: z.object({ success: z.boolean(), message: z.string() }),
    },
    async ({ userId, key, value }) => {
        initializeAdminApp();
        if (!adminApp) {
             const message = "Firebase Admin SDK not initialized. Cannot save preference.";
             console.error(message);
             return { success: false, message };
        }
        
        try {
            const db = getFirestore(adminApp);
            const userRef = db.collection('users').doc(userId);

            // Use dot notation to update a specific field within the aiPreferences map
            const preferenceKey = `aiPreferences.${key}`;
            await userRef.update({
                [preferenceKey]: value
            });
            
            return { success: true, message: `Préférence '${key}' sauvegardée pour l'utilisateur ${userId}.` };
        } catch (error: any) {
            console.error(`Failed to save preference for user ${userId}:`, error);
            return { success: false, message: `Erreur lors de la sauvegarde de la préférence : ${error.message}` };
        }
    }
);
