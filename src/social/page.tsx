
'use client';

import { collection, query, where, doc } from 'firebase/firestore';
import type { Housing, Trip, Tutor, Event } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';
import { GraduationCap, Car, Bed, PartyPopper } from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const StatCard = ({ title, value, icon, href, className, isLoading }: { title: string, value: number, icon: React.ReactNode, href: string, className?: string, isLoading: boolean }) => {
    return (
        <Link href={href} className="block group">
            <Card className={cn("relative overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl h-full flex flex-col justify-between p-5", className)}>
                <div className="z-10">
                    <div className="p-3 bg-white/20 rounded-lg inline-block mb-4">
                       {icon}
                    </div>
                    {isLoading ? (
                        <div className="h-10 w-16 bg-black/10 rounded animate-pulse" />
                    ) : (
                        <div className="text-5xl font-bold text-white">{value}</div>
                    )}
                </div>
                 <h3 className="text-lg font-semibold text-white/90 z-10 mt-2">{title}</h3>
            </Card>
        </Link>
    )
}

export default function SocialPageContent() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, isLoading: profileLoading } = useDoc(userProfileRef);

    const housingsQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'housings'), where('isAvailable', '==', true)), [firestore]);
    const { data: housings, isLoading: housingsLoading } = useCollection<Housing>(housingsQuery);

    const tripsQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'carpoolings'), where('seatsAvailable', '>', 0)), [firestore]);
    const { data: trips, isLoading: tripsLoading } = useCollection<Trip>(tripsQuery);
    
    const tutorsQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'tutorings')), [firestore]);
    const { data: tutors, isLoading: tutorsLoading } = useCollection<Tutor>(tutorsQuery);

    const eventsQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'events')), [firestore]);
    const { data: events, isLoading: eventsLoading } = useCollection<Event>(eventsQuery);
    
    const isLoading = isUserLoading || profileLoading || housingsLoading || tripsLoading || tutorsLoading || eventsLoading;

    if (isLoading && !userProfile) {
        return <PageSkeleton />;
    }

    return (
        <>
            <div className="flex flex-col space-y-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Bienvenue, {userProfile?.firstName || 'Gui'} 👋</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                     <StatCard 
                        title="Sessions de tutorat actives" 
                        value={tutors?.length ?? 0}
                        icon={<GraduationCap className="h-8 w-8 text-white" />}
                        isLoading={isLoading}
                        href="/tutoring"
                        className="bg-blue-500"
                    />
                    <StatCard 
                        title="Trajets disponibles" 
                        value={trips?.length ?? 0}
                        icon={<Car className="h-8 w-8 text-white" />}
                        isLoading={isLoading}
                        href="/carpooling"
                        className="bg-purple-500"
                    />
                    <StatCard 
                        title="Logements disponibles" 
                        value={housings?.length ?? 0}
                        icon={<Bed className="h-8 w-8 text-white" />}
                        isLoading={isLoading}
                        href="/housing"
                        className="bg-pink-500"
                    />
                    <StatCard 
                        title="Événements à venir" 
                        value={events?.length ?? 0}
                        icon={<PartyPopper className="h-8 w-8 text-white" />}
                        isLoading={isLoading}
                        href="/events"
                        className="bg-orange-500"
                    />
                </div>
            </div>
        </>
    );
}