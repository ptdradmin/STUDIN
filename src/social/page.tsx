
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where } from 'firebase/firestore';
import type { Housing, Trip, Tutor, Event } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';
import { GraduationCap, Car, Bed, PartyPopper, PlusSquare, Plus } from "lucide-react";
import { doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import CreatePostForm from "@/components/create-post-form";
import Link from 'next/link';
import { cn } from '@/lib/utils';

const StatCard = ({ title, value, icon, href, className, isLoading }: { title: string, value: number, icon: React.ReactNode, href: string, className?: string, isLoading: boolean }) => {
    return (
        <Link href={href}>
            <Card className={cn("relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", className)}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4">
                    <div className="space-y-1">
                        <CardTitle className="text-sm font-medium text-background/80">{title}</CardTitle>
                         {isLoading ? (
                            <div className="h-9 w-12 bg-black/10 rounded animate-pulse" />
                        ) : (
                            <div className="text-3xl font-bold text-white">{value}</div>
                        )}
                    </div>
                </CardHeader>
                <div className="absolute -right-4 -bottom-4 opacity-15">
                    {icon}
                </div>
            </Card>
        </Link>
    )
}

export default function SocialPageContent() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    
    const [showCreatePostForm, setShowCreatePostForm] = useState(false);

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
            {showCreatePostForm && <CreatePostForm onClose={() => setShowCreatePostForm(false)} />}
            <div className="container mx-auto py-8">
                <div className="space-y-4">
                     <h1 className="text-3xl font-bold tracking-tight">Bienvenue, {userProfile?.firstName || '👋'}</h1>
                     <p className="text-muted-foreground">Voici un aperçu de l'activité sur la plateforme.</p>

                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                        <StatCard 
                            title="Tutorat" 
                            value={tutors?.length ?? 0}
                            icon={<GraduationCap className="h-24 w-24" />}
                            isLoading={isLoading}
                            href="/tutoring"
                            className="bg-gradient-to-br from-blue-400 to-blue-600 text-white"
                        />
                        <StatCard 
                            title="Covoiturage" 
                            value={trips?.length ?? 0}
                            icon={<Car className="h-24 w-24" />}
                            isLoading={isLoading}
                            href="/carpooling"
                            className="bg-gradient-to-br from-green-400 to-green-600 text-white"
                        />
                        <StatCard 
                            title="Logements" 
                            value={housings?.length ?? 0}
                            icon={<Bed className="h-24 w-24" />}
                            isLoading={isLoading}
                            href="/housing"
                            className="bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                        />
                        <StatCard 
                            title="Événements" 
                            value={events?.length ?? 0}
                            icon={<PartyPopper className="h-24 w-24" />}
                            isLoading={isLoading}
                            href="/events"
                            className="bg-gradient-to-br from-purple-400 to-purple-600 text-white"
                        />
                     </div>
                </div>
                 <div className="mt-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold tracking-tight">Accès rapide</h2>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Créer
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setShowCreatePostForm(true)}>
                                    <PlusSquare className="mr-2 h-4 w-4" />
                                    <span>Publication</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/housing"><Bed className="mr-2 h-4 w-4" /><span>Annonce de logement</span></Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/carpooling"><Car className="mr-2 h-4 w-4" /><span>Offre de covoiturage</span></Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/tutoring"><GraduationCap className="mr-2 h-4 w-4" /><span>Offre de tutorat</span></Link></DropdownMenuItem>
                                <DropdownMenuItem asChild><Link href="/events"><PartyPopper className="mr-2 h-4 w-4" /><span>Événement</span></Link></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {/* Placeholder for quick access cards */}
                     </div>
                </div>
            </div>
        </>
    );
}
