

'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import SocialSidebar from '@/components/social-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid, Map, Plus, Target, Loader2 } from 'lucide-react';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import type { Challenge, UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import ChallengeCard from '@/components/challenge-card';
import { useUser, useDoc, useFirestore } from '@/firebase';
import CreateChallengeForm from '@/components/create-challenge-form';
import { doc, collection, query, getDocs, limit, startAfter, QueryDocumentSnapshot, DocumentData, orderBy } from 'firebase/firestore';
import Navbar from '@/components/navbar';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full" />,
});

export default function ChallengesPage() {
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const challengesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'challenges'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const fetchChallenges = useCallback(async (q: any, reset = false) => {
        if (!q) return;
        if (reset) {
            setIsLoading(true);
            setChallenges([]);
            setLastVisible(null);
            setHasMore(true);
        } else {
            setIsLoadingMore(true);
        }

        let finalQuery = q;
        if (!reset && lastVisible) {
            finalQuery = query(q, startAfter(lastVisible), limit(6));
        } else {
            finalQuery = query(q, limit(6));
        }

        try {
            const documentSnapshots = await getDocs(finalQuery);
            const newChallenges = documentSnapshots.docs.map(doc => doc.data() as Challenge);
            const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

            setChallenges(prev => reset ? newChallenges : [...prev, ...newChallenges]);
            setLastVisible(lastDoc || null);
            if (documentSnapshots.docs.length < 6) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching challenges:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [lastVisible]);

    useEffect(() => {
        if (challengesQuery) {
            fetchChallenges(challengesQuery, true);
        }
    }, [challengesQuery, fetchChallenges]);

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    const challengesWithCoords = challenges?.filter(c => c.latitude && c.longitude) || [];
    
    // Defer check until mounted on client
    const canCreateChallenge = isMounted && !isUserLoading && !profileLoading && !!userProfile && (userProfile.role === 'institution' || userProfile.role === 'admin');

    return (
        <div className="flex min-h-screen w-full bg-background">
            {user && <SocialSidebar />}
             {showCreateForm && <CreateChallengeForm onClose={() => setShowCreateForm(false)} />}
            <div className="flex flex-col flex-1">
                 {user ? (
                    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex-1 max-w-md">
                            <GlobalSearch />
                        </div>
                        <div className="flex items-center gap-2">
                            <NotificationsDropdown />
                        </div>
                    </header>
                ) : (
                    <Navbar />
                )}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="mb-8">
                       <div className="flex items-center justify-between">
                         <div>
                            <h1 className="text-3xl font-bold tracking-tight">Défis</h1>
                            <p className="text-muted-foreground mt-1">Transformez votre ville en terrain de jeu. Relevez les défis !</p>
                         </div>
                         {canCreateChallenge && (
                            <Button onClick={() => setShowCreateForm(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Créer un défi
                            </Button>
                         )}
                       </div>
                    </div>

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Filtrer les défis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <div>
                                    <Label htmlFor="category">Catégorie</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Toutes</SelectItem>
                                            <SelectItem value="Exploration">Exploration</SelectItem>
                                            <SelectItem value="Créatif">Créatif</SelectItem>
                                            <SelectItem value="Social">Social</SelectItem>
                                            <SelectItem value="Académique">Académique</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div>
                                    <Label htmlFor="difficulty">Difficulté</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Toutes</SelectItem>
                                            <SelectItem value="facile">Facile</SelectItem>
                                            <SelectItem value="moyen">Moyen</SelectItem>
                                            <SelectItem value="difficile">Difficile</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="location">Localité</Label>
                                    <Input id="location" placeholder="Ex: Bruxelles" />
                                </div>
                                 <div>
                                    <Label htmlFor="sort">Trier par</Label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Les plus récents" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="recent">Les plus récents</SelectItem>
                                            <SelectItem value="points">Points</SelectItem>
                                            <SelectItem value="nearby">Proximité</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end mb-4">
                        <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                          <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="px-3"
                          >
                            <LayoutGrid className="h-5 w-5" />
                          </Button>
                          <Button
                            variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('map')}
                            className="px-3"
                          >
                            <Map className="h-5 w-5" />
                          </Button>
                        </div>
                    </div>


                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                        </div>
                    ) : viewMode === 'list' && challenges ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {challenges.map(challenge => (
                                <ChallengeCard key={challenge.id} challenge={challenge} />
                            ))}
                        </div>
                        {!isLoading && hasMore && (
                            <div className="text-center mt-8">
                                <Button onClick={() => fetchChallenges(challengesQuery)} disabled={isLoadingMore}>
                                    {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Charger plus
                                </Button>
                            </div>
                        )}
                      </>
                    ) : viewMode === 'map' ? (
                       <Card>
                          <CardContent className="p-2">
                            <div className="h-[600px] w-full rounded-md overflow-hidden">
                                <MapView items={challengesWithCoords} itemType="challenge" onMarkerClick={(item) => router.push(`/challenges/${item.id}`)} />
                            </div>
                          </CardContent>
                        </Card>
                    ) : null}


                    {!isLoading && challenges?.length === 0 && (
                         <Card className="text-center py-20 col-span-full">
                            <CardContent>
                                <h3 className="text-xl font-semibold">Aucun défi pour le moment</h3>
                                <p className="text-muted-foreground mt-2">Revenez bientôt pour de nouvelles aventures !</p>
                            </CardContent>
                        </Card>
                    )}

                </main>
            </div>
        </div>
    );
}
