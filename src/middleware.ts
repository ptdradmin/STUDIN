import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';
import type { NextRequest } from 'next/server';

export const config = { matcher: '/welcome' };

export async function middleware(request: NextRequest) {
    const greeting = await get('greeting');
    // NextResponse.json requires at least Next v13.1 or
    // enabling experimental.allowMiddlewareResponseBody in next.config.js
    return NextResponse.json(greeting);
}
