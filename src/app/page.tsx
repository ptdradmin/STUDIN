
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';

export default function HomePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading) {
            if (user) {
                router.replace('/social');
            } else {
                router.replace('/welcome');
            }
        }
    }, [user, isUserLoading, router]);

    // Affiche un squelette de chargement pendant la vérification de l'état d'authentification et la redirection.
    return <PageSkeleton />;
}
