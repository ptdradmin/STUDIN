
'use client';

import { useState, useEffect, useMemo } from 'react';
import SocialSidebar from '@/components/social-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Users, Eye, Loader2, Plus, Trophy } from 'lucide-react';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import type { Challenge, ChallengeSubmission, Event, UserProfile } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useUser, useDoc, useMemoFirebase, useFirestore, useCollection } from '@/firebase';
import { collection, doc, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/page-skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import CreateEventForm from '@/components/create-event-form';
import CreateChallengeForm from '@/components/create-challenge-form';


export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
    const [showCreateEventForm, setShowCreateEventForm] = useState(false);
    const [showCreateChallengeForm, setShowCreateChallengeForm] = useState(false);

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);
    
    const isAuthorized = userProfile?.role === 'institution' || userProfile?.role === 'admin';
    
    // Queries for dynamic data
    const challengesQuery = useMemoFirebase(() => 
        (user && firestore && isAuthorized) ? query(collection(firestore, 'challenges'), where('creatorId', '==', user.uid)) : null,
        [user, firestore, isAuthorized]
    );
    const { data: challenges, isLoading: challengesLoading } = useCollection<Challenge>(challengesQuery);

    const eventsQuery = useMemoFirebase(() =>
        (user && firestore && isAuthorized) ? query(collection(firestore, 'events'), where('organizerId', '==', user.uid)) : null,
        [user, firestore, isAuthorized]
    );
    const { data: events, isLoading: eventsLoading } = useCollection<Event>(eventsQuery);

    const challengeMap = useMemo(() => new Map(challenges?.map(c => [c.id, c])), [challenges]);

    // Fetching submissions for all challenges created by the user
    // NOTE: This is a simplified query. For a large number of challenges, this would need to be handled differently (e.g., fetching submissions per challenge).
    const submissionsQuery = useMemoFirebase(() => {
        if (!firestore || !challenges || challenges.length === 0) return null;
        // This query is simplified and only fetches for the first challenge.
        // A robust solution would require a different data model or multiple queries.
        return query(collection(firestore, 'challenges', challenges[0].id, 'submissions'));
    }, [firestore, challenges]);
    const { data: submissions, isLoading: submissionsLoading } = useCollection<ChallengeSubmission>(submissionsQuery);

    
    useEffect(() => {
        if (!isUserLoading && !profileLoading && (!user || !isAuthorized)) {
            router.push('/social');
        }
    }, [isUserLoading, profileLoading, user, isAuthorized, router]);

    const handleSubmissionAction = async (submissionId: string, challengeId: string, action: 'approve' | 'reject') => {
        if (!firestore) return;
        
        const submissionRef = doc(firestore, 'challenges', challengeId, 'submissions', submissionId);
        
        try {
            await updateDoc(submissionRef, { status: action });
            toast({
                title: `Participation ${action === 'approve' ? 'approuvée' : 'rejetée'}`,
            });
            // Note: Points logic should be handled by a Cloud Function for security.
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour la soumission.' });
        }
    };

    if (isUserLoading || profileLoading || !user || !isAuthorized) {
        return <PageSkeleton />;
    }
    
    const isLoadingData = challengesLoading || eventsLoading || submissionsLoading;

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            {showCreateEventForm && <CreateEventForm onClose={() => setShowCreateEventForm(false)} />}
            {showCreateChallengeForm && <CreateChallengeForm onClose={() => setShowCreateChallengeForm(false)} />}
            <div className="flex flex-col flex-1">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex-1 max-w-md">
                        <GlobalSearch />
                    </div>
                    <div className="flex items-center gap-2">
                        {user && <NotificationsDropdown />}
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Partenaire</h1>
                        <p className="text-muted-foreground mt-1">Gérez vos défis et événements.</p>
                    </div>

                    <Tabs defaultValue="challenges" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="challenges">Gestion des Défis</TabsTrigger>
                            <TabsTrigger value="events">Gestion des Événements</TabsTrigger>
                        </TabsList>
                        <TabsContent value="challenges" className="mt-6">
                           <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Participations aux défis</CardTitle>
                                        <CardDescription>Validez les soumissions des utilisateurs pour vos défis.</CardDescription>
                                    </div>
                                    <Button onClick={() => setShowCreateChallengeForm(true)}>
                                        <Trophy className="mr-2 h-4 w-4" /> Créer un défi
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                {isLoadingData ? (
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                                ) : submissions && submissions.length > 0 ? submissions.map(sub => (
                                    <Card key={sub.id} className="bg-muted/50">
                                        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start">
                                            <div className="relative w-full md:w-32 h-32 flex-shrink-0 rounded-md overflow-hidden">
                                                <Image src={sub.proofUrl} alt={`Preuve de ${sub.userProfile.username}`} layout="fill" objectFit="cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={sub.userProfile.avatarUrl} />
                                                        <AvatarFallback>{sub.userProfile.username.substring(0,2)}</AvatarFallback>
                                                    </Avatar>
                                                    <p className="font-semibold">{sub.userProfile.username}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    A participé au défi : <Link href={`/challenges/${sub.challengeId}`} className="font-semibold text-primary hover:underline">{challengeMap.get(sub.challengeId)?.title || 'Défi inconnu'}</Link>
                                                </p>
                                                <Badge variant={sub.status === 'pending' ? 'default' : sub.status === 'approved' ? 'secondary' : 'destructive'} className="mt-2">{sub.status}</Badge>
                                            </div>
                                            {sub.status === 'pending' && (
                                                <div className="flex gap-2 self-start md:self-center flex-shrink-0">
                                                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleSubmissionAction(sub.id, sub.challengeId, 'reject')}>
                                                        <X className="mr-2 h-4 w-4" /> Rejeter
                                                    </Button>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleSubmissionAction(sub.id, sub.challengeId, 'approve')}>
                                                        <Check className="mr-2 h-4 w-4" /> Approuver
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        Aucune participation en attente.
                                    </div>
                                )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="events" className="mt-6">
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                  <div>
                                    <CardTitle>Vos Événements</CardTitle>
                                    <CardDescription>Suivez le nombre de participants et créez de nouveaux événements.</CardDescription>
                                  </div>
                                  <Button onClick={() => setShowCreateEventForm(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> Créer un événement
                                  </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     {isLoadingData ? (
                                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                                    ) : events && events.length > 0 ? events.map(event => (
                                        <Card key={event.id} className="bg-muted/50">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="flex-grow">
                                                    <h3 className="font-semibold">{event.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{new Date(event.startDate).toLocaleDateString('fr-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                </div>
                                                <Badge variant={(event.attendeeIds?.length || 0) > 0 ? 'default' : 'secondary'} className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    {event.attendeeIds?.length || 0} participant(s)
                                                </Badge>
                                                <Button size="sm" variant="outline" disabled={(event.attendeeIds?.length || 0) === 0}>
                                                    <Eye className="mr-2 h-4 w-4" /> Voir la liste
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )) : (
                                        <div className="text-center py-10 text-muted-foreground">
                                            Vous n'avez aucun événement à venir.
                                        </div>
                                    )}
                                </CardContent>
                             </Card>
                        </TabsContent>
                    </Tabs>
                </main>
            </div>
        </div>
    );
}
