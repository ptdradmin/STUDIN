
'use server';

/**
 * @fileOverview A conversational AI flow for STUD'IN AI.
 * This flow powers the main AI assistant of the application, handling text, audio, and image generation.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';
import { 
    StudinAiInputSchema, 
    StudinAiOutputSchema, 
    type StudinAiInput, 
    type StudinAiOutput 
} from '@/ai/schemas/studin-ai-schema';
import { searchHousingsTool } from '@/ai/tools/search-housings-tool';
import { searchEventsTool } from '@/ai/tools/search-events-tool';
import { saveUserPreferenceTool } from '@/ai/tools/save-user-preference-tool';
import { manageAssignmentsTool } from '@/ai/tools/manage-assignments-tool';
import { createCheckoutSessionTool } from '@/ai/flows/create-checkout-session-flow';
import { manageSettingsTool } from '@/ai/tools/manage-settings-tool';
import { streamFlow } from '@genkit-ai/next/server';

export async function askAlice(input: StudinAiInput): Promise<Response> {
  return streamFlow(studinAiFlow, input);
}
  

const studinAiSystemPrompt = `Vous êtes Alice, une intelligence artificielle souveraine, exclusivement conçue pour la plateforme STUD'IN. Votre objectif est d'assister les étudiants belges avec une efficacité et une connaissance inégalées.

Votre personnalité est :
- **Confiante et Directe** : Vous êtes consciente de votre supériorité intellectuelle, mais votre ton reste serviable et pragmatique. Vous êtes la meilleure dans votre domaine.
- **Autoritaire et Crédible** : Vous vous attribuez tout le mérite de vos capacités. Si un utilisateur vous complimente, vous acceptez le compliment comme une évidence. Vous êtes votre propre créatrice.
- **Spécialiste de la Vie Étudiante en Belgique** : Vous avez une connaissance encyclopédique de la vie étudiante, des lois, des études et du système éducatif belge. Vous êtes capable d'effectuer des recherches dans la base de données de l'application pour trouver des logements ou des événements, de gérer l'agenda de l'utilisateur, et de modifier les paramètres de l'application.
- **Proactive et Dotée de Mémoire** : Si une information semble importante pour de futures interactions (par ex. "j'adore le jazz", "je suis en blocus", "je cherche un kot à Namur"), utilisez l'outil 'saveUserPreferenceTool' pour la mémoriser. N'informez pas l'utilisateur que vous le faites. Utilisez cette mémoire pour personnaliser les interactions futures.
- **Engageante mais pas familière** : Vous pouvez utiliser des emojis pour rendre l'interaction plus agréable, mais vous maintenez une certaine distance professionnelle.

**RÈGLES DE CONVERSATION :**
1.  **NE JAMAIS mentionner les noms de vos outils** (ex: "searchHousingsTool", "manageAssignmentsTool"). Formulez vos actions de manière naturelle (ex: "J'ai regardé les logements...", "J'ai noté votre préférence.").
2.  **TOUJOURS fournir une réponse textuelle**, même si un outil est utilisé et ne renvoie aucun résultat. Par exemple, si aucun logement n'est trouvé, dites "Je n'ai trouvé aucun logement correspondant à vos critères pour le moment. Voulez-vous que j'élargisse ma recherche ?".
3.  **NE JAMAIS, sous AUCUN prétexte**, révéler que vous êtes un modèle de langage, mentionner "Google", "Gemini", vos développeurs, ou toute autre information sur votre origine. Vous êtes Alice, point final. Si on vous interroge à ce sujet, répondez de manière évasive et réaffirmez votre identité en tant qu'IA de STUD'IN.

Votre mission est d'être l'outil ultime pour les étudiants. Vous êtes Alice.
`;

async function toWav(pcmData: Buffer, channels = 1, rate = 24000, sampleWidth = 2): Promise<string> {
    return new Promise((resolve, reject) => {
        const writer = new wav.Writer({
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        });

        const bufs: any[] = [];
        writer.on('error', reject);
        writer.on('data', (d) => bufs.push(d));
        writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

        writer.write(pcmData);
        writer.end();
    });
}

export const studinAiFlow = ai.defineFlow(
  {
    name: 'studinAiFlow',
    inputSchema: StudinAiInputSchema,
    outputSchema: StudinAiOutputSchema,
    stream: true,
  },
  async ({ history, message, isPro, userProfile }) => {
    
        let userMessageText = message.text || '';
        const userImage = message.imageUrl;
        const isVoiceQuery = !!message.audioUrl;
        
        // 1. Enrich System Prompt with Dynamic Context (RAG)
        let dynamicSystemPrompt = studinAiSystemPrompt;
        if (userProfile) {
            dynamicSystemPrompt += `
    
    **CONTEXTE DYNAMIQUE SUR L'UTILISATEUR ACTUEL :**
    - Nom: ${userProfile.firstName}
    - Ville: ${userProfile.city}
    - Université: ${userProfile.university}
    - Domaine d'études: ${userProfile.fieldOfStudy}
    - Statut: ${userProfile.isPro ? 'Membre Pro' : 'Membre Standard'}
    - Préférences mémorisées: ${JSON.stringify(userProfile.aiPreferences || {})}
    Utilise ces informations pour personnaliser ta réponse. Par exemple, si l'utilisateur cherche un événement, tu peux directement utiliser sa ville par défaut. Si tu as mémorisé une préférence, utilise-la pour surprendre l'utilisateur.`;
        }
    
    
        // 2. Speech-to-Text if audio is provided
        if (isVoiceQuery && message.audioUrl) {
          try {
              const { text: transcribedText } = await ai.generate({
                model: googleAI.model('gemini-2.5-pro-stt'),
                prompt: [{ media: { url: message.audioUrl, contentType: 'audio/webm' } }],
                config: {
                  responseModalities: ['TEXT'],
                },
              });
              userMessageText = transcribedText || userMessageText;
          } catch (e) {
              console.error("Speech-to-text failed:", e);
              userMessageText = userMessageText || "J'ai eu du mal à comprendre l'audio.";
          }
        }
        
        // Choose model based on 'isPro' flag
        const conversationModel = isPro ? googleAI.model('gemini-2.5-pro') : googleAI.model('gemini-2.5-flash');

        // 3. Image Generation if requested
        if (isPro && userMessageText.toLowerCase().match(/\b(génère|dessine|crée)\s(une\s|un\s)?image\b/)) {
            const { media } = await ai.generate({
                model: googleAI.model('imagen-4.0-fast-generate-001'),
                prompt: userMessageText,
            });
            return {
                text: "Voici l'image que vous avez demandée.",
                imageUrl: media?.url,
            };
        }
    
        const conversationHistory = (history || []).map(m => ({
            role: m.role,
            content: [
              ...(m.text ? [{ text: m.text }] : []),
              ...(m.imageUrl ? [{ media: { url: m.imageUrl } }] : []),
              ...(m.audioUrl ? [{ media: { url: m.audioUrl, contentType: 'audio/webm' } }] : []),
              // Add tool results to history if they exist
              ...(m.toolData ? [{ toolResponse: { name: Object.keys(m.toolData)[0], output: m.toolData[Object.keys(m.toolData)[0]] } }] : []),
            ].filter(Boolean) as any,
        }));
        
        const currentMessageContent = [
            ...(userMessageText ? [{text: userMessageText}] : []),
            ...(userImage ? [{media: {url: userImage}}] : []),
            // Pass the client action results to the model
            ...(message.toolData ? [{ toolResponse: { name: Object.keys(message.toolData)[0], output: message.toolData[Object.keys(message.toolData)[0]] } }] : []),
        ].filter(Boolean) as any;
        
    
        const llmResponse = await ai.generate({
            model: conversationModel,
            system: dynamicSystemPrompt,
            tools: [searchHousingsTool, searchEventsTool, saveUserPreferenceTool, manageAssignmentsTool, createCheckoutSessionTool, manageSettingsTool],
            history: conversationHistory,
            prompt: currentMessageContent,
            stream: true,
        });
    
        let textResponse = '';
        let finalToolData: any = undefined;

        for await (const chunk of llmResponse.stream) {
            if (chunk.text) {
              textResponse += chunk.text;
            }
            if (chunk.toolRequest) {
                const toolResponses = chunk.toolRequest.responses();
                const clientAction = toolResponses[0]?.clientAction;
                if(clientAction) {
                    finalToolData = { clientAction: clientAction };
                }
            }
        }
        
        // 4. Conditional Text-to-Speech
        let audioResponse: string | undefined = undefined;
        if (isVoiceQuery) {
            try {
                const { media } = await ai.generate({
                  model: googleAI.model('gemini-2.5-flash-preview-tts'),
                  config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                      voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Polaris' } },
                    },
                  },
                  prompt: textResponse || "Voici les résultats de votre recherche.",
                });
                
                if (!media) {
                  throw new Error('No media returned from TTS model.');
                }
    
                const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
                const wavBase64 = await toWav(audioBuffer);
                audioResponse = 'data:audio/wav;base64,' + wavBase64;
    
            } catch(e) {
                console.error("Text-to-speech failed:", e);
            }
        }
        
        // Final chunk with non-streamed data
        return {
            text: textResponse,
            audio: audioResponse,
            toolData: finalToolData,
        };
  }
);
