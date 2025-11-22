
'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Users, LayoutGrid, Map, Plus } from "lucide-react";
import Image from "next/image";
import { Trip } from "@/lib/types";
import dynamic from "next/dynamic";
import { useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { collection } from "firebase/firestore";
import CreateTripForm from "@/components/create-trip-form";
import { useToast } from "@/hooks/use-toast";

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg" />,
});

function TripListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
             <Skeleton className="h-12 w-12 rounded-full" />
             <div className="flex-grow grid grid-cols-2 sm:grid-cols-3 gap-4 items-center w-full">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <div className="col-span-2 sm:col-span-1 flex justify-between sm:justify-end items-center gap-4">
                   <Skeleton className="h-5 w-20" />
                   <Skeleton className="h-5 w-8" />
                </div>
             </div>
             <div className="flex flex-col items-center gap-2 border-l pl-4 ml-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-9 w-20" />
             </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


export default function CarpoolingPage() {
  const firestore = useFirestore();
  const tripsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'carpoolings');
  }, [firestore]);

  const {data: trips, isLoading} = useCollection<Trip>(tripsCollection);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { user } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const handleReserve = () => {
    toast({
      title: "Fonctionnalité en développement",
      description: "La réservation en ligne sera bientôt disponible.",
    });
  };
  
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-4xl font-bold">🚗 Covoiturage</h1>
                  <p className="mt-2 text-lg opacity-90">Partagez vos trajets et économisez</p>
              </div>
          </div>
          <div className="container mx-auto px-4 py-8">
              <Card>
                <CardHeader>
                  <CardTitle>Trouver un trajet</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                      <div className="space-y-2">
                          <Label htmlFor="departure">Lieu de départ</Label>
                          <Input id="departure" placeholder="Ex: Bruxelles" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="arrival">Lieu d'arrivée</Label>
                          <Input id="arrival" placeholder="Ex: Namur" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input id="date" type="date" />
                      </div>
                       <div className="space-y-2 lg:col-span-2">
                           <Button type="submit" className="w-full">Rechercher un covoiturage</Button>
                      </div>
                  </form>
                </CardContent>
              </Card>

              {showCreateForm && <CreateTripForm onClose={() => setShowCreateForm(false)} />}

              <div className="mt-8">
                <div className="flex justify-between items-center mb-4 gap-4">
                  <h2 className="text-2xl font-bold tracking-tight">Trajets disponibles</h2>
                  <div className="flex items-center gap-2">
                    {user && (
                      <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Proposer un trajet
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

                {viewMode === 'list' ? (
                   <div className="space-y-4">
                      {isLoading && <TripListSkeleton />}
                      {!isLoading && trips?.map(trip => (
                          <Card key={trip.id} className="transition-shadow hover:shadow-md">
                              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                  <div className="flex items-center gap-3">
                                      <Image src={`https://api.dicebear.com/7.x/micah/svg?seed=${trip.driverId}`} alt={trip.driverId} width={48} height={48} className="rounded-full" />
                                      <p className="font-semibold sm:hidden">{trip.driverId}</p>
                                  </div>
                                  <div className="hidden sm:flex flex-col items-center">
                                      <p className="font-semibold text-sm">Utilisateur</p>
                                      <p className="text-xs text-muted-foreground">⭐ 4.9</p>
                                  </div>
                                  <div className="flex-grow grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
                                      <div className="flex items-center gap-2">
                                          <MapPin className="h-5 w-5 text-primary"/>
                                          <div>
                                              <p className="font-medium text-sm text-muted-foreground">Départ</p>
                                              <p className="font-semibold">{trip.departureCity}</p>
                                          </div>
                                      </div>
                                       <div className="flex items-center gap-2">
                                          <MapPin className="h-5 w-5 text-secondary"/>
                                          <div>
                                              <p className="font-medium text-sm text-muted-foreground">Arrivée</p>
                                              <p className="font-semibold">{trip.arrivalCity}</p>
                                          </div>
                                      </div>
                                      <div className="col-span-2 sm:col-span-1 flex justify-between sm:justify-end items-center gap-4">
                                          <div className="text-center">
                                              <p className="font-medium text-sm text-muted-foreground">{new Date(trip.departureTime).toLocaleDateString()}</p>
                                              <p className="font-semibold">{new Date(trip.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                          </div>
                                          <div className="flex items-center gap-1 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span className="font-medium text-sm">{trip.seatsAvailable}</span>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="flex flex-col items-center gap-2 border-l pl-4 ml-4">
                                      <p className="text-xl font-bold">{trip.pricePerSeat}€</p>
                                      {user && <Button size="sm" onClick={handleReserve}>Réserver</Button>}
                                  </div>

                              </CardContent>
                          </Card>
                      ))}
                      {!isLoading && trips?.length === 0 && (
                        <Card className="text-center py-20">
                          <CardContent>
                            <h3 className="text-xl font-semibold">Aucun trajet disponible</h3>
                            <p className="text-muted-foreground mt-2">Soyez le premier à proposer un trajet !</p>
                          </CardContent>
                        </Card>
                      )}
                   </div>
                ) : (
                  <Card>
                    <CardContent className="p-2">
                      <div className="h-[600px] w-full rounded-md overflow-hidden">
                          <MapView items={trips || []} itemType="trip" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
          </div>
        </main>
        <Footer />
    </div>
  );
}
