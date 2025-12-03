
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/page-skeleton';

export default function RegisterInstitutionRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the unified register page with the correct role pre-selected
        // (Though the component structure makes this query param optional)
        router.replace('/register'); 
    }, [router]);

    // Display a loading skeleton while redirecting
    return <PageSkeleton />;
}
