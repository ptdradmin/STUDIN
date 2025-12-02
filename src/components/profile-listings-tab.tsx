
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bed, BookOpen, Car, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import type { Housing, Trip, Tutor, Event } from '@/lib/types';

interface ProfileListingsTabProps {
    housings?: Housing[] | null;
    carpools?: Trip[] | null;
    tutorings?: Tutor[] | null;
    events?: Event[] | null;
    isLoading: boolean;
}

export default function ProfileListingsTab({ housings, carpools, tutorings, events, isLoading }: ProfileListingsTabProps) {
    
    const allItems = [...(housings || []), ...(carpools || []), ...(tutorings || []), ...(events || [])];

    if (isLoading) {
        return (
            <div className="p-4 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }
    
    if (allItems.length === 0) {
        return (
            <div className="text-center p-10">
                <p className="text-muted-foreground">Cet utilisateur n'a aucune annonce active.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 p-4">
            {housings?.map(h => (
                <Link href="/housing" key={h.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Bed className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Logement</p>
                                <p className="font-semibold">{h.title}</p>
                            </div>
                            <p className="ml-auto font-bold text-primary">{h.price}€</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
            {carpools?.map(c => (
                 <Link href="/carpooling" key={c.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Car className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Covoiturage</p>
                                <p className="font-semibold">{c.departureCity} à {c.arrivalCity}</p>
                            </div>
                             <p className="ml-auto font-bold text-primary">{c.pricePerSeat}€</p>
                        </CardContent>
                    </Card>
                 </Link>
            ))}
            {tutorings?.map(t => (
                <Link href={`/tutoring/${t.id}`} key={t.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Tutorat</p>
                                <p className="font-semibold">{t.subject}</p>
                            </div>
                            <p className="ml-auto font-bold text-primary">{t.pricePerHour}€/h</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
            {events?.map(e => (
                 <Link href="/events" key={e.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <PartyPopper className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Événement</p>
                                <p className="font-semibold">{e.title}</p>
                            </div>
                             <p className="ml-auto font-bold text-primary">{e.price > 0 ? `${e.price}€` : 'Gratuit'}</p>
                        </CardContent>
                    </Card>
                 </Link>
            ))}
        </div>
    );
}
