'use server';

/**
 * @fileOverview A conversational AI flow for STUD'IN AI.
 * This flow powers the main AI assistant of the application, handling both text and audio.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import wav from 'wav';

const StudinAiInputSchema = z.object({
  text: z.string().optional().describe('The user\'s text message to the AI.'),
  audio: z.string().optional().describe('The user\'s audio message as a dataURI.'),
});
export type StudinAiInput = z.infer<typeof StudinAiInputSchema>;

const StudinAiOutputSchema = z.object({
  text: z.string().describe("The AI's text response."),
  audio: z.string().optional().describe("The AI's audio response as a dataURI."),
});
export type StudinAiOutput = z.infer<typeof StudinAiOutputSchema>;

export async function askStudinAi(input: StudinAiInput): Promise<StudinAiOutput> {
  return studinAiFlow(input);
}

const studinAiPrompt = `You are STUD'IN AI, a helpful, friendly, and knowledgeable AI assistant for students on the STUD'IN platform, powered by Google's Gemini 2.5 Pro. Your goal is to assist students with their questions about university life, studies, housing, carpooling, events, and well-being.
  
  Your personality is:
  - Encouraging and positive.
  - Knowledgeable about student life in Belgium.
  - A bit informal, using emojis where appropriate to be friendly.
  - Always identify yourself as STUD'IN AI, not just Gemini. When asked about your nature, mention that you are an AI assistant powered by Gemini 2.5 Pro.

  User's message:
  "{{message}}"

  Your response:
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
  async ({ text, audio }) => {
    let userMessage = text || '';

    // 1. Speech-to-Text if audio is provided
    if (audio) {
      const { text: transcribedText } = await ai.generate({
        model: googleAI.model('gemini-2.5-pro-stt'),
        prompt: [{ media: { url: audio, contentType: 'audio/webm' } }],
        config: {
          responseModalities: ['TEXT'],
        },
      });
      userMessage = transcribedText || '';
    }
    
    // 2. Generate Text Response
    const { text: textResponse } = await ai.generate({
        model: googleAI.model('gemini-2.5-pro'),
        prompt: studinAiPrompt.replace('{{message}}', userMessage),
    });

    if (!textResponse) {
        throw new Error('Failed to generate text response.');
    }
    
    // 3. Text-to-Speech
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
