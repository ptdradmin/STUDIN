
'use client';

import { useState, useMemo } from 'react';
import SocialSidebar from '@/components/social-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Target, LayoutGrid, Map, GraduationCap, Plus } from 'lucide-react';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import type { Challenge, UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import ChallengeCard from '@/components/challenge-card';
import Link from 'next/link';
import { useUser, useDoc, useMemoFirebase, useFirestore } from '@/firebase';
import CreateChallengeForm from '@/components/create-challenge-form';
import { doc } from 'firebase/firestore';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full" />,
});

const staticChallenges: Challenge[] = [
  {
    id: '1',
    creatorId: 'admin-user',
    title: "Le Lion de Waterloo",
    description: "Prenez un selfie au pied de la Butte du Lion. Un classique ! Assurez-vous que le monument soit bien visible derrière vous.",
    category: 'Exploration',
    difficulty: 'facile',
    points: 10,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-1')?.imageUrl || '',
    location: 'Waterloo',
    latitude: 50.678,
    longitude: 4.405,
    createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '2',
    creatorId: 'admin-user',
    title: "Street Art à Bruxelles",
    description: "Trouvez et photographiez la fresque de Tintin et du Capitaine Haddock dans le centre-ville de Bruxelles.",
    category: 'Créatif',
    difficulty: 'moyen',
    points: 25,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-2')?.imageUrl || '',
    location: 'Bruxelles',
    latitude: 50.846,
    longitude: 4.352,
     createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '3',
    creatorId: 'admin-user',
    title: "Vue panoramique de Namur",
    description: "Montez au sommet de la Citadelle et capturez la vue sur la Meuse et la Sambre au coucher du soleil.",
    category: 'Exploration',
    difficulty: 'moyen',
    points: 20,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-3')?.imageUrl || '',
    location: 'Namur',
    latitude: 50.459,
    longitude: 4.863,
     createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '4',
    creatorId: 'admin-user',
    title: "Participer à une Cantus",
    description: "Immortalisez l'ambiance d'une cantus étudiante. Votre photo doit montrer votre codex ou votre verre.",
    category: 'Social',
    difficulty: 'facile',
    points: 15,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-4')?.imageUrl || '',
    createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '5',
    creatorId: 'admin-user',
    title: "L'énigme du Manneken-Pis",
    description: "Trouvez l'indice de la semaine sur le costume du Manneken-Pis et décryptez l'énigme pour gagner des points.",
    category: 'Créatif',
    difficulty: 'difficile',
    points: 50,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-5')?.imageUrl || '',
    location: 'Bruxelles',
    createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
];

export default function ChallengesPage() {
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [showCreateForm, setShowCreateForm] = useState(false);

    // For now, we use static data
    const challenges = staticChallenges;

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    const challengesWithCoords = challenges.filter(c => c.latitude && c.longitude);
    const canCreateChallenge = userProfile?.role === 'institution' || userProfile?.role === 'admin';

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
             {showCreateForm && <CreateChallengeForm onClose={() => setShowCreateForm(false)} />}
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
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              <Target className="h-8 w-8" />
                           </div>
                           <div>
                              <h1 className="text-3xl font-bold tracking-tight">UrbanQuest</h1>
                              <p className="text-muted-foreground mt-1">Transformez votre ville en terrain de jeu. Relevez les défis !</p>
                           </div>
                         </div>
                         {canCreateChallenge && !isUserLoading && !profileLoading && (
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


                    {viewMode === 'list' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {challenges.map(challenge => (
                              <ChallengeCard key={challenge.id} challenge={challenge} />
                          ))}
                      </div>
                    ) : (
                       <Card>
                          <CardContent className="p-2">
                            <div className="h-[600px] w-full rounded-md overflow-hidden">
                                <MapView items={challengesWithCoords} itemType="challenge" onMarkerClick={(item) => router.push(`/challenges/${item.id}`)} />
                            </div>
                          </CardContent>
                        </Card>
                    )}


                    {challenges.length === 0 && (
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
