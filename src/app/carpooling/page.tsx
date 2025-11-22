
'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Users, LayoutGrid, Map, Plus, Star } from "lucide-react";
import Image from "next/image";
import { Trip, UserProfile } from "@/lib/types";
import dynamic from "next/dynamic";
import { useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { collection, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import CreateTripForm from "@/components/create-trip-form";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

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
  const { user } = useUser();
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

  const {data: trips, isLoading: tripsLoading} = useCollection<Trip>(tripsCollection);
  
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [profilesLoading, setProfilesLoading] = useState(true);

  useEffect(() => {
    if (!trips || !firestore) return;

    const fetchUserProfiles = async () => {
        setProfilesLoading(true);
        const driverIds = [...new Set(trips.map(trip => trip.driverId))];
        if (driverIds.length === 0) {
            setProfilesLoading(false);
            return;
        };

        const newProfiles: Record<string, UserProfile> = {};
        // Firestore 'in' query is limited to 30 elements
        const chunks = [];
        for (let i = 0; i < driverIds.length; i += 30) {
            chunks.push(driverIds.slice(i, i + 30));
        }

        try {
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
        } catch (error) {
            console.error("Error fetching user profiles:", error);
            const permissionError = new FirestorePermissionError({
                path: 'users',
                operation: 'list',
                requestResourceData: { note: `Querying users with IDs in [${driverIds.join(', ')}]` }
            });
            errorEmitter.emit('permission-error', permissionError);
        } finally {
            setProfilesLoading(false);
        }
    }

    fetchUserProfiles();
  }, [trips, firestore]);

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
        toast({
            variant: "destructive",
            title: "Action impossible",
            description: "Vous ne pouvez pas réserver votre propre trajet.",
        });
        return;
    }

    const bookingData = {
        carpoolId: trip.id,
        passengerId: user.uid,
        seatsBooked: 1, // Simple booking for now
        status: 'confirmed',
        createdAt: serverTimestamp(),
    };

    const bookingsCollection = collection(firestore, `carpoolings/${trip.id}/carpool_bookings`);
    addDocumentNonBlocking(bookingsCollection, bookingData);

    toast({
        title: "Réservation confirmée !",
        description: `Votre place pour le trajet ${trip.departureCity} - ${trip.arrivalCity} a été réservée.`,
    });
     router.push(`/messages?recipient=${trip.driverId}`);
  };
  
  const isLoading = tripsLoading || profilesLoading;

  return (
    <>
          <div className="bg-gradient-to-br from-primary/10 via-background to-background text-primary-foreground">
              <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-4xl font-bold text-foreground">🚗 Covoiturage</h1>
                  <p className="mt-2 text-lg text-muted-foreground">Partagez vos trajets et économisez</p>
              </div>
          </div>
          <div className="container mx-auto px-4 py-8">
              <Card>
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
                      {!isLoading && filteredTrips.map(trip => {
                        const driver = userProfiles[trip.driverId];
                        return (
                          <Card key={trip.id} className="transition-shadow hover:shadow-md">
                              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                  <div className="flex items-center gap-3">
                                      <Image src={driver?.profilePicture || `https://api.dicebear.com/7.x/micah/svg?seed=${trip.driverId}`} alt={driver?.firstName || "conducteur"} width={48} height={48} className="rounded-full" />
                                  </div>
                                  <div className="hidden sm:flex flex-col items-center">
                                      <p className="font-semibold text-sm">{driver?.firstName || 'Utilisateur'}</p>
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
                                        <Button size="sm" onClick={() => handleReserve(trip)} disabled={trip.driverId === user.uid || trip.seatsAvailable === 0}>
                                          {trip.seatsAvailable > 0 ? 'Réserver' : 'Complet'}
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
          </div>
    </>
  );
}
