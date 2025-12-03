
'use client';

import { useState, useEffect } from 'react';
import SocialSidebar from '@/components/social-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, Users, Eye, Loader2, Plus } from 'lucide-react';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import type { Challenge, ChallengeSubmission, Event, UserProfile } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/page-skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import CreateEventForm from '@/components/create-event-form';

// Mock data - replace with Firestore queries
const staticChallenges: Challenge[] = [
  { id: '1', creatorId: 'partner-account-id', title: "Le Lion de Waterloo", category: 'Exploration', difficulty: 'facile', points: 10, imageUrl: '', createdAt: { seconds: 1672531200, nanoseconds: 0 } as any, description: '' },
  { id: '5', creatorId: 'partner-account-id', title: "L'énigme du Manneken-Pis", category: 'Créatif', difficulty: 'difficile', points: 50, imageUrl: '', createdAt: { seconds: 1672531200, nanoseconds: 0 } as any, description: '' },
];
const staticSubmissions: (ChallengeSubmission & { id: string })[] = [
    { id: 'sub1', challengeId: '1', userId: 'user1', proofUrl: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?q=80&w=1974&auto=format&fit=crop', status: 'pending', createdAt: { seconds: 1672620000, nanoseconds: 0 } as any, userProfile: { username: 'Alice', avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=alice' } },
    { id: 'sub2', challengeId: '1', userId: 'user2', proofUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1974&auto=format&fit=crop', status: 'pending', createdAt: { seconds: 1672621000, nanoseconds: 0 } as any, userProfile: { username: 'Bob', avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=bob' } },
    { id: 'sub3', challengeId: '5', userId: 'user3', proofUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop', status: 'pending', createdAt: { seconds: 1672622000, nanoseconds: 0 } as any, userProfile: { username: 'Charlie', avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=charlie' } },
];

const staticEvents: (Event & {attendees: UserProfile[]})[] = [
    { id: 'event1', organizerId: 'partner-account-id', title: 'Conférence Tech', category: 'conférence', city: 'Bruxelles', startDate: new Date().toISOString(), attendees: [{id: 'user1', username: 'Alice', firstName: 'Alice', lastName: 'A', email: 'alice@example.com', profilePicture: 'https://api.dicebear.com/7.x/micah/svg?seed=alice'} as UserProfile], attendeeIds: ['user1'], price: 0, imageUrl: '', address: '', description: '', endDate: '', imageHint: '', locationName: '', latitude: 0, longitude: 0, coordinates: [0,0], createdAt: {seconds: 0, nanoseconds: 0} as any, updatedAt: {seconds: 0, nanoseconds: 0} as any },
    { id: 'event2', organizerId: 'partner-account-id', title: 'Soirée BDE', category: 'soirée', city: 'Namur', startDate: new Date().toISOString(), attendees: [], price: 5, imageUrl: '', address: '', description: '', endDate: '', imageHint: '', locationName: '', latitude: 0, longitude: 0, coordinates: [0,0], createdAt: {seconds: 0, nanoseconds: 0} as any, updatedAt: {seconds: 0, nanoseconds: 0} as any },
]


export default function DashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
    const [submissions, setSubmissions] = useState(staticSubmissions);
    const [events, setEvents] = useState(staticEvents);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [showCreateEventForm, setShowCreateEventForm] = useState(false);

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);
    
    const isAuthorized = userProfile?.role === 'institution' || userProfile?.role === 'admin';

    useEffect(() => {
        setTimeout(() => {
            setIsLoadingData(false);
        }, 1000);
    }, []);

    if (isUserLoading || profileLoading) {
        return <PageSkeleton />;
    }

    if (!user || !isAuthorized) {
        router.push('/social'); // Redirect to social if not authorized
        return <PageSkeleton />;
    }
    
    const handleSubmissionAction = (submissionId: string, challengeId: string, action: 'approve' | 'reject') => {
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
        toast({
            title: `Participation ${action === 'approve' ? 'approuvée' : 'rejetée'}`,
            description: `Les points de l'utilisateur ont été mis à jour.`,
        });
        // In a real app, you'd update the submission status and user points in Firestore.
    };
    
    const challengeMap = new Map(staticChallenges.map(c => [c.id, c]));

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            {showCreateEventForm && <CreateEventForm onClose={() => setShowCreateEventForm(false)} />}
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
                            <TabsTrigger value="challenges">Validation des Défis</TabsTrigger>
                            <TabsTrigger value="events">Gestion des Événements</TabsTrigger>
                        </TabsList>
                        <TabsContent value="challenges" className="mt-6">
                           <Card>
                                <CardHeader>
                                    <CardTitle>Participations en attente</CardTitle>
                                    <CardDescription>Validez les soumissions des utilisateurs pour vos défis.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                {isLoadingData ? (
                                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                                ) : submissions.length > 0 ? submissions.map(sub => (
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
                                            </div>
                                            <div className="flex gap-2 self-start md:self-center flex-shrink-0">
                                                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleSubmissionAction(sub.id, sub.challengeId, 'reject')}>
                                                    <X className="mr-2 h-4 w-4" /> Rejeter
                                                </Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleSubmissionAction(sub.id, sub.challengeId, 'approve')}>
                                                    <Check className="mr-2 h-4 w-4" /> Approuver
                                                </Button>
                                            </div>
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
                                    ) : events.length > 0 ? events.map(event => (
                                        <Card key={event.id} className="bg-muted/50">
                                            <CardContent className="p-4 flex items-center gap-4">
                                                <div className="flex-grow">
                                                    <h3 className="font-semibold">{event.title}</h3>
                                                    <p className="text-sm text-muted-foreground">{new Date(event.startDate).toLocaleDateString('fr-BE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                                </div>
                                                <Badge variant={event.attendees.length > 0 ? 'default' : 'secondary'} className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    {event.attendees.length} participant(s)
                                                </Badge>
                                                <Button size="sm" variant="outline" disabled={event.attendees.length === 0}>
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
