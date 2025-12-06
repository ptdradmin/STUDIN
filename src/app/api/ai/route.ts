

import { appRoute } from '@genkit-ai/next';
import { studinAiFlow } from '@/ai/flows/studin-ai-flow';

export const runtime = 'nodejs';

export const POST = appRoute(studinAiFlow);
