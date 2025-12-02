
'use client';

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Users, LayoutGrid, Map, Plus, Star, Search } from "lucide-react";
import Image from "next/image";
import { Trip } from "@/lib/types";
import dynamic from "next/dynamic";
import { useCollection, useUser, useFirestore, useMemoFirebase, FirestorePermissionError, errorEmitter } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, serverTimestamp, doc, writeBatch, arrayUnion, increment } from "firebase/firestore";
import CreateTripForm from "@/components/create-trip-form";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import SocialSidebar from "@/components/social-sidebar";
import GlobalSearch from "@/components/global-search";
import NotificationsDropdown from "@/components/notifications-dropdown";
import { createNotification } from "@/lib/actions";

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg" />,
});

function TripListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
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
          </div>
        </Card>
      ))}
    </div>
  )
}


export default function CarpoolingPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [departureFilter, setDepartureFilter] = useState('');
  const [arrivalFilter, setArrivalFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const tripsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'carpoolings');
  }, [firestore]);

  const {data: trips, isLoading } = useCollection<Trip>(tripsCollection);

  const filteredTrips = useMemo(() => {
    if (!trips) return [];
    return trips.filter(trip => {
      const departureMatch = departureFilter ? trip.departureCity.toLowerCase().includes(departureFilter.toLowerCase()) : true;
      const arrivalMatch = arrivalFilter ? trip.arrivalCity.toLowerCase().includes(arrivalFilter.toLowerCase()) : true;
      const dateMatch = dateFilter ? new Date(trip.departureTime).toLocaleDateString() === new Date(dateFilter).toLocaleDateString() : true;
      return departureMatch && arrivalMatch && dateMatch;
    });
  }, [trips, departureFilter, arrivalFilter, dateFilter]);

 const handleReserve = (trip: Trip) => {
    if (!user || !firestore) {
        router.push('/login?from=/carpooling');
        return;
    }
    if (trip.driverId === user.uid) {
        toast({ variant: "destructive", title: "Action impossible", description: "Vous ne pouvez pas réserver votre propre trajet." });
        return;
    }
    if ((trip.passengerIds || []).includes(user.uid)) {
        toast({ title: "Déjà réservé", description: "Vous avez déjà une place pour ce trajet." });
        return;
    }
    if (trip.seatsAvailable <= 0) {
        toast({ variant: "destructive", title: "Complet", description: "Ce trajet n'a plus de places disponibles." });
        return;
    }

    toast({
        title: "Réservation en cours...",
        description: `Nous traitons votre demande pour le trajet ${trip.departureCity} - ${trip.arrivalCity}.`,
    });
    
    const batch = writeBatch(firestore);
    const carpoolingRef = doc(firestore, 'carpoolings', trip.id);
    const bookingRef = doc(collection(firestore, `carpoolings/${trip.id}/carpool_bookings`));
    
    const bookingData = {
      id: bookingRef.id,
      carpoolId: trip.id,
      passengerId: user.uid,
      seatsBooked: 1,
      status: 'confirmed',
      createdAt: serverTimestamp()
    };
    
    const carpoolingUpdateData = {
        seatsAvailable: increment(-1),
        passengerIds: arrayUnion(user.uid)
    };

    batch.update(carpoolingRef, carpoolingUpdateData);
    batch.set(bookingRef, bookingData);

    batch.commit()
    .then(() => {
        // Create notification on successful reservation
        createNotification(firestore, {
            type: 'carpool_booking',
            senderId: user.uid,
            recipientId: trip.driverId,
            relatedId: trip.id,
            message: `a réservé une place pour votre trajet ${trip.departureCity} - ${trip.arrivalCity}.`
        });
        toast({
            title: "Réservation confirmée !",
            description: "Votre place a été réservée avec succès.",
        });
    })
    .catch((serverError) => {
        // Create a contextual permission error for debugging
        const permissionError = new FirestorePermissionError({
            path: `Transaction on carpoolings/${trip.id} and carpool_bookings subcollection`,
            operation: 'write',
            requestResourceData: { 
                carpoolingUpdate: carpoolingUpdateData,
                bookingCreation: bookingData,
            }
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <SocialSidebar />
      <div className="flex flex-col flex-1">
        {showCreateForm && <CreateTripForm onClose={() => setShowCreateForm(false)} />}
        
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Trouver un trajet</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end" onSubmit={e => e.preventDefault()}>
                  <div className="space-y-2">
                      <Label htmlFor="departure">Lieu de départ</Label>
                      <Input id="departure" placeholder="Ex: Bruxelles" value={departureFilter} onChange={e => setDepartureFilter(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="arrival">Lieu d'arrivée</Label>
                      <Input id="arrival" placeholder="Ex: Namur" value={arrivalFilter} onChange={e => setArrivalFilter(e.target.value)}/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                  </div>
              </form>
            </CardContent>
          </Card>


          <div className="mt-8">
            <div className="flex justify-between items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold tracking-tight">Trajets disponibles</h2>
              <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreateForm(true)} disabled={isUserLoading || !user}>
                  <Plus className="mr-2 h-4 w-4" /> Proposer un trajet
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

            {viewMode === 'list' ? (
                <div className="space-y-4">
                  {isLoading && <TripListSkeleton />}
                  {!isLoading && filteredTrips.map(trip => {
                    const isPassenger = user && (trip.passengerIds || []).includes(user.uid);
                    return (
                      <Card key={trip.id} className="transition-shadow hover:shadow-md">
                          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                              <div className="flex items-center gap-3">
                                  <Image src={trip.userAvatarUrl || `https://api.dicebear.com/7.x/micah/svg?seed=${trip.driverId}`} alt={trip.username || "conducteur"} width={48} height={48} className="rounded-full" />
                              </div>
                              <div className="hidden sm:flex flex-col items-center">
                                  <p className="font-semibold text-sm">{trip.username || 'Utilisateur'}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500 fill-yellow-500"/> 4.9</p>
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
                                        {trip.seatsAvailable > 0 ? (
                                          <Badge variant="outline" className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {trip.seatsAvailable}
                                          </Badge>
                                        ) : (
                                          <Badge variant="destructive">Complet</Badge>
                                        )}
                                  </div>
                              </div>

                              <div className="flex flex-col items-center gap-2 border-l pl-4 ml-4">
                                  <p className="text-xl font-bold">{trip.pricePerSeat}€</p>
                                  {user && (
                                    <Button size="sm" onClick={() => handleReserve(trip)} disabled={trip.driverId === user.uid || trip.seatsAvailable === 0 || isPassenger}>
                                      {isPassenger ? 'Réservé' : (trip.seatsAvailable > 0 ? 'Réserver' : 'Complet')}
                                    </Button>
                                  )}
                              </div>

                          </CardContent>
                      </Card>
                  )})}
                  {!isLoading && filteredTrips.length === 0 && (
                    <Card className="text-center py-20">
                      <CardContent>
                        <h3 className="text-xl font-semibold">Aucun trajet ne correspond à votre recherche</h3>
                        <p className="text-muted-foreground mt-2">Essayez d'élargir vos critères ou soyez le premier à proposer un trajet !</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
            ) : (
              <Card>
                <CardContent className="p-2">
                  <div className="h-[600px] w-full rounded-md overflow-hidden">
                      <MapView items={filteredTrips} itemType="trip" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );

    
