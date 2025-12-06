
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { format } from 'date-fns';
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
  id: z.string(),
  title: z.string(),
  subject: z.string(),
  dueDate: z.any().describe("Date d'échéance"),
  status: z.enum(['todo', 'in-progress', 'done']),
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
