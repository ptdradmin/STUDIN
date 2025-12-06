
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
<<<<<<< HEAD
import { format } from 'date-fns';
=======
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import type { Assignment } from '@/lib/types';
import { parse, format } from 'date-fns';
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4
import { fr } from 'date-fns/locale';

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
<<<<<<< HEAD
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  dueDate: z.any().describe("Date d'échéance"),
  status: z.enum(['todo', 'in-progress', 'done']),
=======
    id: z.string(),
    title: z.string(),
    subject: z.string(),
    dueDate: z.string().describe("Date au format 'Mardi 28 mai'"),
    status: z.enum(['todo', 'in-progress', 'done']),
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4
});
export type AssignmentForTool = z.infer<typeof AssignmentSchemaForTool>;

export const manageAssignmentsTool = ai.defineTool(
    {
        name: 'manageAssignmentsTool',
        description: "Gère l'agenda académique d'un utilisateur : ajoute, liste, met à jour ou supprime des devoirs et examens. L'outil ne peut pas accéder directement à la base de données, il doit donc retourner une action que le client exécutera.",
        inputSchema: ManageAssignmentsInputSchema,
        outputSchema: z.object({
            success: z.boolean(),
            message: z.string(),
            clientAction: z.object({
                type: z.literal('MANAGE_ASSIGNMENTS'),
                payload: ManageAssignmentsInputSchema,
            }).optional(),
            results: z.array(AssignmentSchemaForTool).optional().describe("Uniquement pour l'action 'list', la liste des devoirs retournée par le client."),
        }),
    },
    async ({ userId, action, assignment }) => {
<<<<<<< HEAD
        // This tool now returns an action for the client to execute,
        // respecting client-side security rules. It no longer uses firebase-admin.

        if (action === 'list') {
            // The 'list' action can be simulated by telling the client to perform it.
            // The client-side code will then fetch the data using its own credentials.
            return {
                success: true,
                message: "Je vais récupérer vos prochaines échéances.",
                clientAction: {
                    type: 'MANAGE_ASSIGNMENTS',
                    payload: { userId, action: 'list' }
                }
            };
        }
        
        if (action === 'add' || action === 'update' || action === 'remove') {
             if (!assignment || (action !== 'remove' && !assignment.title)) {
                return { success: false, message: "Les informations de la tâche sont incomplètes." };
=======
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
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4
            }
            // Return a client action for mutations
            return {
                success: true,
                message: `Je vais ${action === 'add' ? 'ajouter' : action === 'update' ? 'mettre à jour' : 'supprimer'} la tâche.`,
                clientAction: {
                    type: 'MANAGE_ASSIGNMENTS',
                    payload: { userId, action, assignment }
                }
            };
        }

        return { success: false, message: "Action non reconnue." };
    }
);
