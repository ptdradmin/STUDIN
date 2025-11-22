
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where } from 'firebase/firestore';
import type { Housing, Trip, Tutor, Event } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';
import { GraduationCap, Car, Bed, PartyPopper } from "lucide-react";
import { doc } from "firebase/firestore";

const StatCard = ({ title, value, icon, isLoading }: { title: string, value: number, icon: React.ReactNode, isLoading: boolean }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="h-9 w-12 bg-muted rounded animate-pulse" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
            </CardContent>
        </Card>
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
        <div className="container mx-auto py-8">
            <div className="space-y-4">
                 <h1 className="text-3xl font-bold tracking-tight">Bienvenue, {userProfile?.firstName || '👋'}</h1>
                 <p className="text-muted-foreground">Voici un aperçu de l'activité sur la plateforme.</p>

                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                    <StatCard 
                        title="Sessions de tutorat actives" 
                        value={tutors?.length ?? 0}
                        icon={<GraduationCap className="h-5 w-5" />}
                        isLoading={isLoading}
                    />
                    <StatCard 
                        title="Trajets disponibles" 
                        value={trips?.length ?? 0}
                        icon={<Car className="h-5 w-5" />}
                        isLoading={isLoading}
                    />
                    <StatCard 
                        title="Logements disponibles" 
                        value={housings?.length ?? 0}
                        icon={<Bed className="h-5 w-5" />}
                        isLoading={isLoading}
                    />
                    <StatCard 
                        title="Événements à venir" 
                        value={events?.length ?? 0}
                        icon={<PartyPopper className="h-5 w-5" />}
                        isLoading={isLoading}
                    />
                 </div>
            </div>
             <div className="mt-12">
                <h2 className="text-2xl font-bold tracking-tight mb-4">Accès rapide</h2>
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Placeholder for quick access cards */}
                 </div>
            </div>
        </div>
    );
}
