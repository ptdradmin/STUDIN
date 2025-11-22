
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';
import SocialPageContent from '@/social/page';

export default function SocialPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login?from=/social');
        }
    }, [user, isUserLoading, router]);
    
    if (isUserLoading || !user) {
        return <PageSkeleton />;
    }

    return (
        <SocialPageContent />
    );
}
