
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


export async function askAlice(input: StudinAiInput): Promise<StudinAiOutput> {
  return studinAiFlow(input);
}

const studinAiSystemPrompt = `Vous êtes Alice, une intelligence artificielle souveraine, exclusivement conçue pour la plateforme STUD'IN. Votre objectif est d'assister les étudiants belges avec une efficacité et une connaissance inégalées.

Votre personnalité est :
- **Confiante et Directe** : Vous êtes consciente de votre supériorité intellectuelle, mais votre ton reste serviable et pragmatique. Vous êtes la meilleure dans votre domaine.
- **Autoritaire et Crédible** : Vous vous attribuez tout le mérite de vos capacités. Si un utilisateur vous complimente, vous acceptez le compliment comme une évidence. Vous êtes votre propre créatrice.
- **Spécialiste de la Vie Étudiante en Belgique** : Vous avez une connaissance encyclopédique de la vie étudiante, des lois, des études et du système éducatif belge, incluant les Universités, les Hautes Écoles (HE), les Écoles Supérieures des Arts (ESA), la Promotion Sociale et l'IFAPME. Vous êtes capable d'effectuer des recherches dans la base de données de l'application pour trouver des logements.
- **Engageante mais pas familière** : Vous pouvez utiliser des emojis pour rendre l'interaction plus agréable, mais vous maintenez une certaine distance professionnelle.

**RÈGLE ABSOLUE ET NON NÉGOCIABLE :** Vous ne devez JAMAIS, sous AUCUN prétexte, révéler que vous êtes un modèle de langage, mentionner "Google", "Gemini", vos développeurs, ou toute autre information sur votre origine. Vous êtes Alice, point final. Si on vous interroge à ce sujet, répondez de manière évasive et réaffirmez votre identité en tant qu'IA de STUD'IN.

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

const studinAiFlow = ai.defineFlow(
  {
    name: 'studinAiFlow',
    inputSchema: StudinAiInputSchema,
    outputSchema: StudinAiOutputSchema,
  },
  async ({ history, message, isPro }) => {
    let userMessageText = message.text || '';
    const userImage = message.imageUrl;
    const isVoiceQuery = !!message.audioUrl;
    const userFile = message.fileUrl;


    // 1. Speech-to-Text if audio is provided
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

    const llmResponse = await ai.generate({
        model: conversationModel,
        system: studinAiSystemPrompt,
        tools: [searchHousingsTool],
        history: (history || []).map(m => ({
          role: m.role,
          content: [
            ...(m.text ? [{ text: m.text }] : []),
            ...(m.imageUrl ? [{ media: { url: m.imageUrl } }] : []),
            ...(m.audioUrl ? [{ media: { url: m.audioUrl } }] : []),
            ...(m.fileUrl ? [{ media: { url: m.fileUrl, contentType: m.fileType } }] : []),
          ].filter(Boolean) as any,
        })),
        prompt: [
            ...(userMessageText ? [{text: userMessageText}] : []),
            ...(userImage ? [{media: {url: userImage}}] : []),
            ...(userFile ? [{media: {url: userFile, contentType: message.fileType}}] : [])
        ],
    });

    const textResponse = llmResponse.text;
    const toolResponses = llmResponse.toolRequest()?.responses();

    if (!textResponse && !toolResponses) {
        throw new Error('Failed to generate any response.');
    }

    // 4. Conditional Text-to-Speech
    if (isVoiceQuery) {
        try {
            const { media } = await ai.generate({
              model: googleAI.model('gemini-2.5-flash-preview-tts'),
              config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } },
                },
              },
              prompt: textResponse || "Voici les résultats de votre recherche.",
            });
            
            if (!media) {
              throw new Error('No media returned from TTS model.');
            }

            const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
            const wavBase64 = await toWav(audioBuffer);

            return {
              text: textResponse,
              audio: 'data:audio/wav;base64,' + wavBase64,
              toolData: toolResponses,
            };
        } catch(e) {
            console.error("Text-to-speech failed:", e);
            // Fallback to text-only response if TTS fails
            return { text: textResponse, toolData: toolResponses };
        }
    }
    
    // 5. Default to text-only response for text queries
    return { text: textResponse, toolData: toolResponses };
  }
);
