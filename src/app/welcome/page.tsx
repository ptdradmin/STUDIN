
'use client';

// This page is intentionally left blank. 
// The main landing page content is now in src/app/page.tsx.
// This file can be removed in the future if no longer needed.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/page-skeleton';

export default function WelcomeRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/');
    }, [router]);

    return <PageSkeleton />;
}
