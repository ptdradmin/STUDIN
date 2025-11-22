
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, LayoutGrid, Map, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/types";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useUser } from '@/firebase';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg" />,
});


export default function EventsPage() {
  const { data: events, isLoading } = useCollection<Event>('events');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { user } = useUser();

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events && events.map(event => (
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
                        <Button className="w-full mt-4">Voir les détails</Button>
                    </CardContent>
                </Card>
            ))}
             {!isLoading && events?.length === 0 && (
              <Card className="col-span-full text-center py-20">
                <CardContent>
                  <h3 className="text-xl font-semibold">Aucun événement trouvé</h3>
                  <p className="text-muted-foreground mt-2">Soyez le premier à créer un événement !</p>
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
                <MapView items={events || []} itemType="event" />
            </div>
          </CardContent>
        </Card>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-4xl font-bold">🎉 Événements</h1>
                  <p className="mt-2 text-lg opacity-90">Ne manquez aucune activité étudiante</p>
              </div>
          </div>
          <div className="container mx-auto px-4 py-8">
              <Card>
                  <CardHeader>
                      <CardTitle>Filtrer les événements</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                          <div className="space-y-2">
                              <Label htmlFor="city">Ville</Label>
                              <Input id="city" placeholder="Ex: Louvain-la-Neuve" />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="university">Université</Label>
                                <Select>
                                  <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="all">Toutes</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="category">Catégorie</Label>
                              <Select>
                                  <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="all">Toutes</SelectItem>
                                      <SelectItem value="party">Soirée</SelectItem>
                                      <SelectItem value="conference">Conférence</SelectItem>
                                      <SelectItem value="culture">Culture</SelectItem>
                                      <SelectItem value="sport">Sport</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="lg:col-span-2">
                            <Button type="submit" className="w-full">Filtrer</Button>
                          </div>
                      </form>
                  </CardContent>
              </Card>

              <div className="mt-8">
                <div className="flex justify-between items-center mb-4 gap-4">
                  <h2 className="text-2xl font-bold tracking-tight">Événements à venir</h2>
                   <div className="flex items-center gap-2">
                    {user && (
                      <Button>
                        <Plus className="mr-2 h-4 w-4" /> Créer un événement
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
