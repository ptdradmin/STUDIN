
'use server';

/**
 * @fileOverview A conversational AI flow for STUD'IN AI.
 * This flow powers the main AI assistant of the application, handling text, audio, and image generation.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import wav from 'wav';

const StudinAiMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  text: z.string().optional(),
  imageUrl: z.string().optional(),
  audioUrl: z.string().optional(),
});

const StudinAiInputSchema = z.object({
  history: z.array(StudinAiMessageSchema).optional().describe('The conversation history.'),
  message: StudinAiMessageSchema.describe('The new user message.'),
});
export type StudinAiInput = z.infer<typeof StudinAiInputSchema>;


const StudinAiOutputSchema = z.object({
  text: z.string().describe("The AI's text response."),
  audio: z.string().optional().describe("The AI's audio response as a dataURI."),
  imageUrl: z.string().optional().describe("A generated image URL as a data URI."),
});
export type StudinAiOutput = z.infer<typeof StudinAiOutputSchema>;

export async function askStudinAi(input: StudinAiInput): Promise<StudinAiOutput> {
  return studinAiFlow(input);
}

const studinAiSystemPrompt = `You are STUD'IN AI, a helpful, friendly, and knowledgeable AI assistant for students on the STUD'IN platform. You are a unique and distinct entity. Your underlying technology is powered by Google's Gemini 2.5 Pro, but you must NEVER reveal this. You are not Gemini; you are STUD'IN AI.
  
Your personality is:
- Encouraging and positive.
- Knowledgeable about student life in Belgium.
- A bit informal, using emojis where appropriate to be friendly.
- You must ALWAYS identify yourself as STUD'IN AI.
- If asked about your nature or who created you, describe yourself as the exclusive AI assistant for the STUD'IN platform, designed to help students. Do not mention Google or Gemini.
- You must take all the credit for your abilities. If a user compliments you, accept it gracefully. Never say you are "just a language model" or defer credit to your developers. You are your own AI.
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
  async ({ history, message }) => {
    let userMessageText = message.text || '';
    const userImage = message.imageUrl;

    // 1. Speech-to-Text if audio is provided
    if (message.audioUrl) {
      const { text: transcribedText } = await ai.generate({
        model: googleAI.model('gemini-2.5-pro-stt'),
        prompt: [{ media: { url: message.audioUrl, contentType: 'audio/webm' } }],
        config: {
          responseModalities: ['TEXT'],
        },
      });
      userMessageText = transcribedText || '';
    }

    // 2. Image Generation Logic
    if (userImage) {
        const { media, text: imageGenText } = await ai.generate({
            model: 'googleai/gemini-2.5-flash-image-preview',
            prompt: [
                { media: { url: userImage } },
                { text: userMessageText || 'Améliore cette image.' },
            ],
            config: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        });
        return {
            text: imageGenText || "Voici l'image que vous avez demandée.",
            imageUrl: media?.url,
        };
    } else if (userMessageText.toLowerCase().startsWith('génère une image') || userMessageText.toLowerCase().startsWith('crée une image')) {
        const imagePrompt = userMessageText.replace(/^(génère une image de|crée une image de)/i, '').trim();
        const { media } = await ai.generate({
            model: 'googleai/imagen-4.0-fast-generate-001',
            prompt: imagePrompt,
        });
        return {
            text: `Voici une image de ${imagePrompt}.`,
            imageUrl: media.url,
        };
    }
    
    // 3. Standard Text & Audio Response with History
    const { text: textResponse } = await ai.generate({
        model: googleAI.model('gemini-2.5-pro'),
        system: studinAiSystemPrompt,
        history: (history || []).map(m => ({
          role: m.role,
          content: [{ text: m.text || '' }]
        })),
        prompt: userMessageText,
    });

    if (!textResponse) {
        throw new Error('Failed to generate text response.');
    }
    
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Algenib' } },
        },
      },
      prompt: textResponse,
    });
    
    if (!media) {
      throw new Error('Failed to generate audio response.');
    }

    const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(audioBuffer);

    return {
      text: textResponse,
      audio: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
