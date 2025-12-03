
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, LayoutGrid, Map, Plus, Search, Bookmark, GraduationCap, BookOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Tutor, Favorite } from "@/lib/types";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import CreateTutorForm from '@/components/create-tutor-form';
import { useRouter } from "next/navigation";
import SocialSidebar from '@/components/social-sidebar';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { toggleFavorite } from '@/lib/actions';
import Navbar from '@/components/navbar';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg" />,
});


export default function TutoringPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [subjectFilter, setSubjectFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const tutorsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tutorings');
  }, [firestore]);

  const { data: tutors, isLoading } = useCollection<Tutor>(tutorsCollection);

  const favoritesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/favorites`), where('itemType', '==', 'tutor'));
  }, [user, firestore]);
  const { data: favorites } = useCollection<Favorite>(favoritesQuery);
  const favoritedIds = useMemo(() => new Set(favorites?.map(f => f.itemId)), [favorites]);

  const filteredTutors = useMemo(() => {
    if (!tutors) return [];
    return tutors.filter(tutor => {
      const subjectMatch = subjectFilter ? tutor.subject.toLowerCase().includes(subjectFilter.toLowerCase()) : true;
      const levelMatch = levelFilter && levelFilter !== 'all' ? tutor.level.toLowerCase().includes(levelFilter.toLowerCase()) : true;
      return subjectMatch && levelMatch;
    });
  }, [tutors, subjectFilter, levelFilter]);

  const handleFavoriteClick = async (e: React.MouseEvent, tutor: Tutor, isFavorited: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !firestore) {
      router.push('/login?from=/tutoring');
      return;
    }
    try {
      await toggleFavorite(firestore, user.uid, { id: tutor.id, type: 'tutor' }, isFavorited);
      toast({ title: isFavorited ? 'Retiré des favoris' : 'Ajouté aux favoris' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour les favoris.' });
    }
  };

  const handleCreateClick = () => {
    if (!user) {
        router.push('/login?from=/tutoring');
        return;
    }
    setShowCreateForm(true);
  }

  const renderList = () => {
     if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
             <Card key={i} className="flex flex-col text-center items-center p-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex flex-col flex-grow mt-4 w-full space-y-2">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-20 mx-auto" />
                    <div className="pt-4 mt-auto space-y-2">
                      <Skeleton className="h-8 w-1/2 mx-auto" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                </div>
             </Card>
          ))}
        </div>
      );
    }
    
    if (filteredTutors?.length === 0) {
        return (
            <Card className="col-span-full text-center py-20">
                <CardContent>
                    <h3 className="text-xl font-semibold">Aucun tuteur ne correspond à votre recherche</h3>
                    <p className="text-muted-foreground mt-2">Essayez d'élargir vos critères ou soyez le premier à proposer vos services !</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors && filteredTutors.map(tutor => {
              const isFavorited = favoritedIds.has(tutor.id);
              const isOwner = user?.uid === tutor.tutorId;
              return (
                  <Link href={`/tutoring/${tutor.id}`} key={tutor.id} className="block h-full">
                    <Card className="flex flex-col text-center items-center p-6 transition-shadow hover:shadow-xl h-full relative">
                        {user && !isOwner && (
                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full absolute top-2 right-2" onClick={(e) => handleFavoriteClick(e, tutor, isFavorited)}>
                                <Bookmark className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                            </Button>
                        )}
                        <div className="flex-shrink-0">
                        <Image src={tutor.userAvatarUrl || `https://api.dicebear.com/7.x/micah/svg?seed=${tutor.tutorId}`} alt={tutor.username || "tuteur"} width={96} height={96} className="rounded-full" />
                        </div>
                        <div className="flex flex-col flex-grow mt-4">
                        <h3 className="text-xl font-bold">{tutor.username || 'Utilisateur'}</h3>
                        <p className="text-sm text-muted-foreground">{tutor.level}</p>
                        <Badge variant="secondary" className="mt-3 mx-auto">{tutor.subject}</Badge>
                        <div className="flex items-center justify-center gap-1 text-yellow-500 mt-3">
                            <Star className="h-5 w-5 fill-current" />
                            <span className="font-bold text-base text-foreground">{tutor.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <p className="text-2xl font-bold text-primary mt-auto pt-4">{tutor.pricePerHour}€/h</p>
                        </div>
                         <div className="w-full mt-4 space-x-2">
                            {tutor.locationType !== 'online' && <Badge variant="outline">En personne</Badge>}
                            {tutor.locationType !== 'in-person' && <Badge variant="outline">En ligne</Badge>}
                        </div>
                    </Card>
                  </Link>
            )})}
        </div>
    );
  }

  const renderMap = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-2">
            <Skeleton className="h-[600px] w-full rounded-md" />
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardContent className="p-2">
          <div className="h-[600px] w-full rounded-md overflow-hidden">
              <MapView items={filteredTutors} itemType="tutor" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {user && <SocialSidebar />}
      <div className="flex flex-col flex-1">
        {showCreateForm && <CreateTutorForm onClose={() => setShowCreateForm(false)} />}

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
             <h1 className="text-3xl font-bold tracking-tight">Tutorat</h1>
             <p className="text-muted-foreground mt-1">Obtenez de l'aide ou proposez vos compétences dans toutes les matières.</p>
          </div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Trouver un tuteur</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end" onSubmit={e => e.preventDefault()}>
                  <div className="space-y-2">
                      <Label htmlFor="subject">Matière</Label>
                      <Input id="subject" placeholder="Ex: Mathématiques, Droit..." value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="level">Niveau</Label>
                      <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger><SelectValue placeholder="Tous niveaux" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous niveaux</SelectItem>
                            <SelectItem value="bachelier">Bachelier</SelectItem>
                            <SelectItem value="master">Master</SelectItem>
                            <SelectItem value="secondaire">Secondaire</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                  <div className="lg:col-span-2">
                  </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold tracking-tight">Tuteurs disponibles</h2>
              <div className="flex items-center gap-2">
                <Button onClick={handleCreateClick} disabled={isUserLoading}>
                  <Plus className="mr-2 h-4 w-4" /> Devenir tuteur
                </Button>
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
            </div>
            {viewMode === 'list' ? renderList() : renderMap()}
          </div>
        </main>
      </div>
    </div>
  );
}
