
import { NextRequest, NextResponse } from 'next/server';
import { streamFlow } from '@genkit-ai/next/server';
import { studinAiFlow } from '@/ai/flows/studin-ai-flow';
import { StudinAiInputSchema } from '@/ai/schemas/studin-ai-schema';

// This endpoint is implemented using the Next.js streaming-firs Edge runtime.
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  // We are not validating the request body here, because we will do it in the flow.
  const body = await req.json();

  // The `streamFlow` helper will validate the input, run the flow,
  // and return a streaming response.
  return streamFlow(studinAiFlow, body);
}
