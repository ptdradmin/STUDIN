

import { NextRequest, NextResponse } from 'next/server';
import { streamFlow } from '@genkit-ai/next/server';
import { studinAiFlow } from '@/ai/flows/studin-ai-flow';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const body = await req.json();

  return streamFlow(studinAiFlow, body);
}
