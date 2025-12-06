
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
<<<<<<< HEAD
=======
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

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
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4

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
<<<<<<< HEAD
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
=======
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
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4
    }
);
