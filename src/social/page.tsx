
'use client';

import { collection, query, where, doc } from 'firebase/firestore';
import type { Housing, Trip, Tutor, Event } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';
import { GraduationCap, Car, Bed, PartyPopper, Plus } from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreatePostForm from '@/components/create-post-form';
import { useState } from 'react';

const StatCard = ({ title, value, icon, href, className, isLoading }: { title: string, value: number, icon: React.ReactNode, href: string, className?: string, isLoading: boolean }) => {
    return (
        <Link href={href} className="block group">
            <Card className={cn("overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl", className)}>
                <CardContent className="p-5 h-full flex flex-col justify-between">
                     <div className="p-3 bg-white/20 rounded-lg w-min">
                       {icon}
                    </div>
                    <div>
                        {isLoading ? (
                            <Skeleton className="h-10 w-16 bg-white/20" />
                        ) : (
                            <div className="text-4xl font-bold text-white">{value}</div>
                        )}
                        <h3 className="text-md font-semibold text-white/90">{title}</h3>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

export default function SocialPageContent() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const [showCreatePost, setShowCreatePost] = useState(false);
    
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
        <div className="flex flex-col space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Bienvenue, {userProfile?.firstName || 'Gui'} 👋</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                 <StatCard 
                    title="Sessions de tutorat" 
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
             <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Accès rapide</h2>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Créer
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setShowCreatePost(true)}>Publication</DropdownMenuItem>
                        <DropdownMenuItem disabled>Logement</DropdownMenuItem>
                        <DropdownMenuItem disabled>Covoiturage</DropdownMenuItem>
                        <DropdownMenuItem disabled>Événement</DropdownMenuItem>
                        <DropdownMenuItem disabled>Tutorat</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {showCreatePost && <CreatePostForm onClose={() => setShowCreatePost(false)} />}
        </div>
    );
}
