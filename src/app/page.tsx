
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';

export default function HomePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        // Ne rien faire tant que l'état d'authentification n'est pas connu.
        if (isUserLoading) {
            return;
        }

        // Une fois l'état connu, rediriger.
        if (user) {
            router.replace('/social');
        } else {
            router.replace('/welcome');
        }
    }, [user, isUserLoading, router]);

    // Afficher un squelette de chargement pendant la vérification et la redirection.
    return <PageSkeleton />;
}
