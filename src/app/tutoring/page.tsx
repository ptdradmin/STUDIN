
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, LayoutGrid, Map, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Tutor, UserProfile } from "@/lib/types";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import CreateTutorForm from '@/components/create-tutor-form';
import { useRouter } from "next/navigation";

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg" />,
});


export default function TutoringPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [subjectFilter, setSubjectFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  const tutorsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'tutorings');
  }, [firestore]);

  const { data: tutors, isLoading: tutorsLoading } = useCollection<Tutor>(tutorsCollection);

  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [profilesLoading, setProfilesLoading] = useState(true);

  useEffect(() => {
    if (!tutors || !firestore) return;

    const fetchUserProfiles = async () => {
        setProfilesLoading(true);
        const tutorIds = [...new Set(tutors.map(tutor => tutor.tutorId))];
        if (tutorIds.length === 0) {
            setProfilesLoading(false);
            return;
        };

        const newProfiles: Record<string, UserProfile> = {};
        const chunks = [];
        for (let i = 0; i < tutorIds.length; i += 30) {
            chunks.push(tutorIds.slice(i, i + 30));
        }

        for (const chunk of chunks) {
            if (chunk.length > 0) {
                const usersQuery = query(collection(firestore, 'users'), where('id', 'in', chunk));
                const usersSnapshot = await getDocs(usersQuery);
                usersSnapshot.forEach(doc => {
                    newProfiles[doc.id] = doc.data() as UserProfile;
                });
            }
        }
        
        setUserProfiles(prev => ({...prev, ...newProfiles}));
        setProfilesLoading(false);
    }

    fetchUserProfiles();
  }, [tutors, firestore]);

  const filteredTutors = useMemo(() => {
    if (!tutors) return [];
    return tutors.filter(tutor => {
      const subjectMatch = subjectFilter ? tutor.subject.toLowerCase().includes(subjectFilter.toLowerCase()) : true;
      const levelMatch = levelFilter && levelFilter !== 'all' ? tutor.level.toLowerCase().includes(levelFilter.toLowerCase()) : true;
      return subjectMatch && levelMatch;
    });
  }, [tutors, subjectFilter, levelFilter]);


  const handleContact = (tutorId: string) => {
    if (!user) {
        router.push('/login?from=/tutoring');
        return;
    }
    router.push(`/messages?recipient=${tutorId}`);
  };

  const isLoading = tutorsLoading || profilesLoading;

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors && filteredTutors.map(tutor => {
              const tutorProfile = userProfiles[tutor.tutorId];
              return (
                  <Card key={tutor.id} className="flex flex-col text-center items-center p-6 transition-shadow hover:shadow-xl">
                    <div className="flex-shrink-0">
                      <Image src={tutorProfile?.profilePicture || `https://api.dicebear.com/7.x/micah/svg?seed=${tutor.tutorId}`} alt={tutorProfile?.firstName || "tuteur"} width={96} height={96} className="rounded-full" />
                    </div>
                    <div className="flex flex-col flex-grow mt-4">
                      <h3 className="text-xl font-bold">{tutorProfile?.firstName || 'Utilisateur'}</h3>
                      <p className="text-sm text-muted-foreground">{tutor.level}</p>
                      <Badge variant="secondary" className="mt-3 mx-auto">{tutor.subject}</Badge>
                      <div className="flex items-center justify-center gap-1 text-yellow-500 mt-3">
                          <Star className="h-5 w-5 fill-current" />
                          <span className="font-bold text-base text-foreground">{tutor.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                      <p className="text-2xl font-bold text-primary mt-auto pt-4">{tutor.pricePerHour}€/h</p>
                    </div>
                    <div className="w-full mt-4 space-y-2">
                        {tutor.locationType !== 'online' && <Badge variant="outline">En personne</Badge>}
                        {tutor.locationType !== 'in-person' && <Badge variant="outline">En ligne</Badge>}
                    </div>
                    {user && <Button className="w-full mt-4" onClick={() => handleContact(tutor.tutorId)}>Contacter</Button>}
                  </Card>
            )})}
             {!isLoading && filteredTutors?.length === 0 && (
                <Card className="col-span-full text-center py-20">
                    <CardContent>
                        <h3 className="text-xl font-semibold">Aucun tuteur ne correspond à votre recherche</h3>
                        <p className="text-muted-foreground mt-2">Essayez d'élargir vos critères ou soyez le premier à proposer vos services !</p>
                    </CardContent>
                </Card>
            )}
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
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background text-primary-foreground">
              <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-4xl font-bold text-foreground">📚 Tutorat</h1>
                  <p className="mt-2 text-lg text-muted-foreground">Trouvez de l'aide ou proposez vos services</p>
              </div>
          </div>
          <div className="container mx-auto px-4 py-8">
              <Card>
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

              {showCreateForm && <CreateTutorForm onClose={() => setShowCreateForm(false)} />}

               <div className="mt-8">
                <div className="flex justify-between items-center mb-4 gap-4">
                  <h2 className="text-2xl font-bold tracking-tight">Tuteurs disponibles</h2>
                  <div className="flex items-center gap-2">
                    {user && (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Devenir tuteur
                      </Button>
                    )}
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
          </div>
        </main>
        <Footer />
    </div>
  );
}
