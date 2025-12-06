
'use client';

import { memo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProfileListingsTab from '@/components/profile-listings-tab';
import type { Housing, Trip, Tutor, Event } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

interface MyListingsProps {
    user: import('firebase/auth').User;
    isActive: boolean;
}

const MyListings = memo(({ user, isActive }: MyListingsProps) => {
    const firestore = useFirestore();

    // Only create queries when tab is active
    const housingQuery = useMemoFirebase(() => {
        if (!isActive || !firestore) return null;
        return query(collection(firestore, 'housings'), where('userId', '==', user.uid));
    }, [firestore, user.uid, isActive]);

    const carpoolQuery = useMemoFirebase(() => {
        if (!isActive || !firestore) return null;
        return query(collection(firestore, 'carpoolings'), where('driverId', '==', user.uid));
    }, [firestore, user.uid, isActive]);

    const tutorQuery = useMemoFirebase(() => {
        if (!isActive || !firestore) return null;
        return query(collection(firestore, 'tutorings'), where('tutorId', '==', user.uid));
    }, [firestore, user.uid, isActive]);

    const eventQuery = useMemoFirebase(() => {
        if (!isActive || !firestore) return null;
        return query(collection(firestore, 'events'), where('organizerId', '==', user.uid));
    }, [firestore, user.uid, isActive]);

    const { data: housings, isLoading: l1 } = useCollection<Housing>(housingQuery);
    const { data: carpools, isLoading: l2 } = useCollection<Trip>(carpoolQuery);
    const { data: tutorings, isLoading: l3 } = useCollection<Tutor>(tutorQuery);
    const { data: events, isLoading: l4 } = useCollection<Event>(eventQuery);

    const isLoading = l1 || l2 || l3 || l4;

    if (!isActive) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="p-4">
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    const allListings = [...(housings || []), ...(carpools || []), ...(tutorings || []), ...(events || [])];

    if (allListings.length === 0) {
        return (
            <div className="text-center p-10">
                <p className="text-muted-foreground">Vous n'avez aucune annonce active.</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <ProfileListingsTab
                housings={housings}
                carpools={carpools}
                tutorings={tutorings}
                events={events}
                isLoading={isLoading}
            />
        </div>
    );
});

MyListings.displayName = 'MyListings';

export default MyListings;
