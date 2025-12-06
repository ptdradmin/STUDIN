
'use client';

import { memo, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Car, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import type { Trip, Event } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

interface MyActivitiesProps {
    user: import('firebase/auth').User;
    isActive: boolean;
}

const MyActivities = memo(({ user, isActive }: MyActivitiesProps) => {
    const firestore = useFirestore();

    // Only create queries when tab is active
    const carpoolBookingsQuery = useMemoFirebase(() => {
        if (!isActive || !firestore) return null;
        return query(collection(firestore, 'carpoolings'), where('passengerIds', 'array-contains', user.uid));
    }, [firestore, user.uid, isActive]);

    const attendedEventsQuery = useMemoFirebase(() => {
        if (!isActive || !firestore) return null;
        return query(collection(firestore, 'events'), where('attendeeIds', 'array-contains', user.uid));
    }, [firestore, user.uid, isActive]);

    const { data: bookedCarpools, isLoading: l1 } = useCollection<Trip>(carpoolBookingsQuery);
    const { data: attendedEvents, isLoading: l2 } = useCollection<Event>(attendedEventsQuery);

    const isLoading = l1 || l2;

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

    if (bookedCarpools?.length === 0 && attendedEvents?.length === 0) {
        return (
            <div className="text-center p-10">
                <p className="text-muted-foreground">Vous n'avez aucune activité à venir.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4">
            {bookedCarpools?.map(c => (
                <Link href="/carpooling" key={c.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Car className="h-5 w-5 text-secondary-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Covoiturage réservé</p>
                                <p className="font-semibold">{c.departureCity} à {c.arrivalCity}</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
            {attendedEvents?.map(e => (
                <Link href="/events" key={e.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <PartyPopper className="h-5 w-5 text-secondary-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Événement</p>
                                <p className="font-semibold">{e.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
});

MyActivities.displayName = 'MyActivities';

export default MyActivities;
