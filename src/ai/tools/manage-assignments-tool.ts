'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import type { Assignment } from '@/lib/types';
import { parse, format } from 'date-fns';
import { fr } from 'date-fns/locale';

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
            console.error("Failed to initialize Firebase Admin SDK for assignments:", e);
        }
    }
}

const ManageAssignmentsInputSchema = z.object({
    userId: z.string().describe("L'ID de l'utilisateur pour lequel gérer les tâches."),
    action: z.enum(['add', 'list', 'update', 'remove']).describe("L'action à effectuer."),
    assignment: z.object({
        id: z.string().optional().describe("L'ID de la tâche à mettre à jour ou supprimer."),
        title: z.string().optional().describe("Le titre de la tâche ou de l'examen."),
        subject: z.string().optional().describe("La matière concernée."),
        dueDate: z.string().optional().describe("La date d'échéance au format 'yyyy-MM-dd'."),
        status: z.enum(['todo', 'in-progress', 'done']).optional().describe("Le statut de la tâche."),
    }).optional(),
});
type ManageAssignmentsInput = z.infer<typeof ManageAssignmentsInputSchema>;


const AssignmentSchemaForTool = z.object({
    id: z.string(),
    title: z.string(),
    subject: z.string(),
    dueDate: z.string().describe("Date au format 'Mardi 28 mai'"),
    status: z.enum(['todo', 'in-progress', 'done']),
});
export type AssignmentForTool = z.infer<typeof AssignmentSchemaForTool>;

export const manageAssignmentsTool = ai.defineTool(
    {
        name: 'manageAssignmentsTool',
        description: "Gère l'agenda académique d'un utilisateur : ajoute, liste, met à jour ou supprime des devoirs et examens.",
        inputSchema: ManageAssignmentsInputSchema,
        outputSchema: z.object({
            success: z.boolean(),
            message: z.string(),
            assignments: z.array(AssignmentSchemaForTool).optional(),
        }),
    },
    async ({ userId, action, assignment }) => {
        initializeAdminApp();
        if (!adminApp) {
            const message = "Firebase Admin SDK not initialized.";
            console.error(message);
            return { success: false, message };
        }

        const db = getFirestore(adminApp);
        const assignmentsCol = db.collection('users').doc(userId).collection('assignments');

        try {
            switch (action) {
                case 'add':
                    if (!assignment?.title || !assignment.dueDate) {
                        return { success: false, message: "Le titre et la date d'échéance sont requis pour ajouter une tâche." };
                    }
                    const newDocRef = assignmentsCol.doc();
                    const newAssignment: Assignment = {
                        id: newDocRef.id,
                        userId,
                        title: assignment.title,
                        subject: assignment.subject || 'Général',
                        dueDate: Timestamp.fromDate(parse(assignment.dueDate, 'yyyy-MM-dd', new Date())) as any,
                        status: 'todo',
                        createdAt: Timestamp.now() as any,
                    };
                    await newDocRef.set(newAssignment);
                    return { success: true, message: `"${assignment.title}" a été ajouté à votre agenda.` };

                case 'list':
                    const snapshot = await assignmentsCol.where('status', '!=', 'done').orderBy('status').orderBy('dueDate', 'asc').limit(10).get();
                    if (snapshot.empty) {
                        return { success: true, message: "Vous n'avez aucune tâche à venir.", assignments: [] };
                    }
                    const assignments = snapshot.docs.map(doc => {
                        const data = doc.data() as Assignment;
                        return {
                            ...data,
                            dueDate: format(data.dueDate.toDate(), "EEEE d MMMM", { locale: fr }),
                        };
                    });
                    return { success: true, message: "Voici vos prochaines échéances.", assignments };

                case 'update':
                    if (!assignment?.id || !assignment.status) {
                        return { success: false, message: "L'ID de la tâche et le nouveau statut sont requis." };
                    }
                    await assignmentsCol.doc(assignment.id).update({ status: assignment.status });
                    return { success: true, message: "La tâche a été mise à jour." };

                case 'remove':
                    if (!assignment?.id) {
                        return { success: false, message: "L'ID de la tâche est requis pour la suppression." };
                    }
                    await assignmentsCol.doc(assignment.id).delete();
                    return { success: true, message: "La tâche a été supprimée." };

                default:
                    return { success: false, message: "Action non reconnue." };
            }
        } catch (error: any) {
            console.error(`Failed to ${action} assignment for user ${userId}:`, error);
            return { success: false, message: `Erreur lors de l'opération : ${error.message}` };
        }
    }
);
