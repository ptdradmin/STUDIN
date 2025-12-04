
'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Users, LayoutGrid, Map, Plus, Star, Search, MessageSquare, GraduationCap, Car } from "lucide-react";
import Image from "next/image";
import { Trip } from "@/lib/types";
import dynamic from "next/dynamic";
import { useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, serverTimestamp, doc, runTransaction, increment } from "firebase/firestore";
import CreateTripForm from "@/components/create-trip-form";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import SocialSidebar from "@/components/social-sidebar";
import GlobalSearch from "@/components/global-search";
import NotificationsDropdown from "@/components/notifications-dropdown";
import { createNotification } from "@/lib/actions";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { getOrCreateConversation } from "@/lib/conversations";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Navbar from "@/components/navbar";

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
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const [departureFilter, setDepartureFilter] = useState('');
  const [arrivalFilter, setArrivalFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  const tripsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'carpoolings');
  }, [firestore]);

  const {data: trips, isLoading } = useCollection<Trip>(tripsCollection);
  
  const [clientTrips, setClientTrips] = useState<Trip[] | null>(null);
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (trips && isClient) {
        // Generate random coordinates only on the client-side
        const tripsWithArrivalCoords = trips.map(trip => ({
            ...trip,
            arrivalCoordinates: [
              (trip.coordinates[0] || 50.46) + (Math.random() - 0.5) * 0.5,
              (trip.coordinates[1] || 4.87) + (Math.random() - 0.5) * 0.5,
            ]
        }));
        setClientTrips(tripsWithArrivalCoords);
    } else {
        setClientTrips(trips);
    }
  }, [trips, isClient]);


  const filteredTrips = useMemo(() => {
    if (!clientTrips) return [];
    
    return clientTrips.filter(trip => {
      const departureMatch = departureFilter ? trip.departureCity.toLowerCase().includes(departureFilter.toLowerCase()) : true;
      const arrivalMatch = arrivalFilter ? trip.arrivalCity.toLowerCase().includes(arrivalFilter.toLowerCase()) : true;
      const dateMatch = dateFilter ? new Date(trip.departureTime).toLocaleDateString() === new Date(dateFilter).toLocaleDateString() : true;
      return departureMatch && arrivalMatch && dateMatch;
    });
  }, [clientTrips, departureFilter, arrivalFilter, dateFilter]);

  const handleContact = async (trip: Trip) => {
    if (isUserLoading) return;
    if (!user || !firestore) {
        router.push('/login?from=/carpooling');
        return;
    }
    if (trip.driverId === user.uid) {
        toast({ variant: "destructive", title: "Action impossible", description: "Vous ne pouvez pas vous contacter vous-même." });
        return;
    }

    const conversationId = await getOrCreateConversation(firestore, user.uid, trip.driverId);
    if (conversationId) {
        router.push(`/messages/${conversationId}`);
    } else {
        toast({ title: "Erreur", description: "Impossible de démarrer la conversation.", variant: "destructive" });
    }
  };

 const handleReserve = async (trip: Trip) => {
    if (isUserLoading || !user || !firestore) {
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

    toast({
        title: "Réservation en cours...",
        description: `Nous traitons votre demande pour le trajet ${trip.departureCity} - ${trip.arrivalCity}.`,
    });
    
    const carpoolingRef = doc(firestore, 'carpoolings', trip.id);
    const bookingRef = doc(collection(firestore, `carpoolings/${trip.id}/carpool_bookings`));
    
    try {
        await runTransaction(firestore, async (transaction) => {
            const carpoolingDoc = await transaction.get(carpoolingRef);
            if (!carpoolingDoc.exists()) {
                throw new Error("Trajet non trouvé.");
            }

            const currentData = carpoolingDoc.data() as Trip;

            if (currentData.seatsAvailable <= 0) {
                throw new Error("Ce trajet est complet.");
            }
            
            const newSeatsAvailable = currentData.seatsAvailable - 1;
            const newPassengerIds = [...(currentData.passengerIds || []), user.uid];

            const bookingData = {
              id: bookingRef.id,
              carpoolId: trip.id,
              passengerId: user.uid,
              seatsBooked: 1,
              status: 'confirmed',
              createdAt: serverTimestamp()
            };

            const carpoolingUpdateData = {
                seatsAvailable: newSeatsAvailable,
                passengerIds: newPassengerIds
            };

            transaction.update(carpoolingRef, carpoolingUpdateData);
            transaction.set(bookingRef, bookingData);
        });

        await createNotification(firestore, {
            type: 'carpool_booking',
            senderId: user.uid,
            recipientId: trip.driverId,
            message: `a réservé une place pour votre trajet ${trip.departureCity} - ${trip.arrivalCity}.`,
            relatedId: trip.id,
        });

        toast({
            title: "Réservation confirmée !",
            description: "Votre place a été réservée avec succès.",
        });

    } catch (e: any) {
        const permissionError = new FirestorePermissionError({
            path: `Transaction on carpoolings/${trip.id} and its subcollection`,
            operation: 'write', 
            requestResourceData: { 
                action: 'reserve_seat',
                carpoolId: trip.id,
                passengerId: user?.uid,
                clientError: e.message,
            }
        } as SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    }
  };
  
  const handleSelectTrip = (trip: Trip) => {
      setSelectedTrip(trip);
      setViewMode('map');
  }

  const handleCreateClick = () => {
    if (isUserLoading) return;
    if (!user) {
        router.push('/login?from=/carpooling');
        return;
    }
    setShowCreateForm(true);
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {user && <SocialSidebar />}
      <div className="flex flex-col flex-1">
        {showCreateForm && <CreateTripForm onClose={() => setShowCreateForm(false)} />}
        
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
             <h1 className="text-3xl font-bold tracking-tight">Covoiturage</h1>
             <p className="text-muted-foreground mt-1">Partagez vos trajets, économisez et rencontrez d'autres étudiants.</p>
            </div>

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
                <Button onClick={handleCreateClick} disabled={isUserLoading}>
                  <Plus className="mr-2 h-4 w-4" /> Proposer un trajet
                </Button>
                <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => { setViewMode('list'); setSelectedTrip(null); }}
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
                  {!isLoading && filteredTrips && filteredTrips.map(trip => {
                    const isPassenger = user && (trip.passengerIds || []).includes(user.uid);
                    return (
                      <Card key={trip.id} className={cn("transition-shadow hover:shadow-md cursor-pointer", selectedTrip?.id === trip.id && "ring-2 ring-primary")} onClick={() => handleSelectTrip(trip)}>
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
                                  {user ? (
                                    <>
                                        <Button size="sm" onClick={(e) => {e.stopPropagation(); handleReserve(trip);}} disabled={trip.driverId === user.uid || trip.seatsAvailable === 0 || isPassenger}>
                                            {isPassenger ? 'Réservé' : (trip.seatsAvailable > 0 ? 'Réserver' : 'Complet')}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={(e) => {e.stopPropagation(); handleContact(trip);}} disabled={trip.driverId === user.uid}>
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                    </>
                                  ) : (
                                    <Button size="sm" onClick={(e) => {e.stopPropagation(); router.push('/login?from=/carpooling');}}>
                                        Réserver
                                    </Button>
                                  )}
                              </div>

                          </CardContent>
                      </Card>
                  )})}
                  {!isLoading && filteredTrips && filteredTrips.length === 0 && (
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
                  {isClient && <div className="h-[600px] w-full rounded-md overflow-hidden">
                      <MapView items={filteredTrips || []} itemType="trip" selectedItem={selectedTrip} onMarkerClick={setSelectedTrip} />
                  </div>}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
