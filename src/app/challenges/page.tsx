'use client';

import { useState } from 'react';
import SocialSidebar from '@/components/social-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Target, Trophy, LayoutGrid, Map } from 'lucide-react';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import type { Challenge } from '@/lib/types';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full" />,
});

const staticChallenges: Challenge[] = [
  {
    id: '1',
    title: "Le Lion de Waterloo",
    description: "Prenez un selfie au pied de la Butte du Lion. Un classique ! Assurez-vous que le monument soit bien visible derrière vous. Bonus si vous imitez la posture du lion !",
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
    title: "Street Art à Bruxelles",
    description: "Trouvez et photographiez la fresque de Tintin et du Capitaine Haddock dans le centre-ville. La photo doit inclure un objet jaune pour prouver que vous y étiez récemment.",
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
    title: "Vue panoramique de Namur",
    description: "Montez au sommet de la Citadelle et capturez la vue sur la Meuse et la Sambre. Le défi doit être réalisé au coucher du soleil pour un maximum de points.",
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
    title: "Participer à une Cantus",
    description: "Immortialisez l'ambiance d'une cantus étudiante (avec respect et consentement !). Votre photo doit montrer votre codex ou votre verre.",
    category: 'Social',
    difficulty: 'facile',
    points: 15,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-4')?.imageUrl || '',
     createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '5',
    title: "L'énigme du Manneken-Pis",
    description: "Le plus célèbre ket de Bruxelles a un secret. Chaque jeudi, un indice est révélé dans sa garde-robe. Trouvez l'indice de cette semaine et décryptez-le. Soumettez la réponse comme preuve.",
    category: 'Créatif',
    difficulty: 'difficile',
    points: 50,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-5')?.imageUrl || '',
    location: 'Bruxelles', // On peut donner la ville sans les coordonnées précises
    createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
];


const ChallengeCard = ({ challenge }: { challenge: Challenge }) => {
  const difficultyColors = {
    facile: 'bg-green-500',
    moyen: 'bg-yellow-500',
    difficile: 'bg-red-500',
  };
  
  const imageHint = PlaceHolderImages.find(p => p.imageUrl === challenge.imageUrl)?.imageHint || 'student challenge';

  return (
    <Link href={`/challenges/${challenge.id}`} className="block h-full">
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl group h-full flex flex-col">
            <div className="relative aspect-video">
                <Image src={challenge.imageUrl} alt={challenge.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={imageHint} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10"></div>
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">{challenge.category}</Badge>
                </div>
                 <div className="absolute bottom-2 left-4 text-white">
                    <h3 className="text-xl font-bold drop-shadow-md">{challenge.title}</h3>
                </div>
            </div>
            <CardContent className="p-4 flex flex-col flex-grow">
                 <p className="text-sm text-muted-foreground mb-4 h-10 flex-grow">{challenge.description}</p>
                <div className="flex justify-between items-center mt-auto">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${difficultyColors[challenge.difficulty]}`}></div>
                        <span className="text-sm capitalize font-medium">{challenge.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-lg">{challenge.points}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    </Link>
  );
};


export default function ChallengesPage() {
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    // For now, we use static data
    const challenges = staticChallenges;

    const challengesWithCoords = challenges.filter(c => c.latitude && c.longitude);

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex flex-col flex-1">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="hidden md:flex flex-1 max-w-md items-center">
                        <GlobalSearch />
                    </div>
                    <div className="flex-1 md:hidden">
                        <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationsDropdown />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="mb-6 flex justify-between items-center">
                       <div>
                         <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                            <Target className="h-8 w-8 text-primary" />
                            UrbanQuest
                        </h1>
                        <p className="text-muted-foreground mt-1">Transformez votre ville en terrain de jeu. Relevez les défis !</p>
                       </div>
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
