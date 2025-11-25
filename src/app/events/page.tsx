
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, LayoutGrid, Map, Plus, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/types";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import CreateEventForm from '@/components/create-event-form';
import { useToast } from '@/hooks/use-toast';
import SocialSidebar from '@/components/social-sidebar';
import UserSearch from '@/components/user-search';
import NotificationsDropdown from '@/components/notifications-dropdown';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg" />,
});


export default function EventsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [cityFilter, setCityFilter] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [universities, setUniversities] = useState<string[]>([]);
  
  const eventsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'events');
  }, [firestore]);

  const { data: events, isLoading } = useCollection<Event>(eventsCollection);

  useEffect(() => {
    if (!events || !firestore) return;
    const fetchUniversities = async () => {
        try {
            const fetchedUniversities = new Set<string>();
            events.forEach((event) => {
              if (event.university) {
                fetchedUniversities.add(event.university);
              }
            });
            setUniversities(Array.from(fetchedUniversities));
        } catch (error) {
            console.error("Error fetching universities from events:", error);
        }
    };
    fetchUniversities();
  }, [events, firestore]);

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(event => {
      const cityMatch = cityFilter ? event.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
      const universityMatch = universityFilter && universityFilter !== 'all' ? event.university === universityFilter : true;
      const categoryMatch = categoryFilter && categoryFilter !== 'all' ? event.category === categoryFilter : true;
      return cityMatch && universityMatch && categoryMatch;
    });
  }, [events, cityFilter, universityFilter, categoryFilter]);


  const handleDetails = () => {
    toast({
      title: "Fonctionnalité en développement",
      description: "Plus de détails sur l'événement seront bientôt disponibles.",
    });
  };

  const renderList = () => {
    if (isLoading) {
      return (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
             <Card key={i} className="overflow-hidden flex flex-col">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-4 flex flex-col flex-grow">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full mt-2" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                    <Skeleton className="h-10 w-full mt-4" />
                </CardContent>
             </Card>
          ))}
        </div>
      )
    }

    if (filteredEvents?.length === 0) {
        return (
            <Card className="col-span-full text-center py-20">
                <CardContent>
                    <h3 className="text-xl font-semibold">Aucun événement ne correspond à votre recherche</h3>
                    <p className="text-muted-foreground mt-2">Essayez d'élargir vos critères ou soyez le premier à créer un événement !</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents && filteredEvents.map(event => (
                <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-xl flex flex-col">
                    <div className="relative">
                        <Image src={event.imageUrl} alt={event.title} width={600} height={400} className="aspect-video w-full object-cover" data-ai-hint={event.imageHint} />
                        <Badge className="absolute top-2 right-2">{event.category}</Badge>
                    </div>
                    <CardContent className="p-4 flex flex-col flex-grow">
                        <p className="font-semibold text-primary">{new Date(event.startDate).toLocaleDateString()}</p>
                        <h3 className="text-lg font-bold mt-1 flex-grow">{event.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center mt-2">
                            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                            {event.city}
                        </p>
                        <Button className="w-full mt-4" onClick={handleDetails}>Voir les détails</Button>
                    </CardContent>
                </Card>
            ))}
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
                <MapView items={filteredEvents} itemType="event" />
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <SocialSidebar />
      <div className="flex flex-col flex-1">
        {showCreateForm && <CreateEventForm onClose={() => setShowCreateForm(false)} />}
        
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="hidden md:flex flex-1 max-w-md items-center">
                <UserSearch />
            </div>
            <div className="flex-1 md:hidden">
                <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
            </div>
            <div className="flex items-center gap-2">
                <NotificationsDropdown />
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Card className="mb-6">
              <CardHeader>
                  <CardTitle>Filtrer les événements</CardTitle>
              </CardHeader>
              <CardContent>
                  <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end" onSubmit={e => e.preventDefault()}>
                      <div className="space-y-2">
                          <Label htmlFor="city">Ville</Label>
                          <Input id="city" placeholder="Ex: Louvain-la-Neuve" value={cityFilter} onChange={e => setCityFilter(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="university">Université</Label>
                            <Select value={universityFilter} onValueChange={setUniversityFilter}>
                              <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">Toutes</SelectItem>
                                  {universities.map(uni => <SelectItem key={uni} value={uni}>{uni}</SelectItem>)}
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="category">Catégorie</Label>
                          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                              <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">Toutes</SelectItem>
                                  <SelectItem value="soirée">Soirée</SelectItem>
                                  <SelectItem value="conférence">Conférence</SelectItem>
                                  <SelectItem value="culture">Culture</SelectItem>
                                  <SelectItem value="sport">Sport</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                  </form>
              </CardContent>
          </Card>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold tracking-tight">Événements à venir</h2>
                <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreateForm(true)} disabled={isUserLoading || !user}>
                  <Plus className="mr-2 h-4 w-4" /> Créer un événement
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

    