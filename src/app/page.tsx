
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { getHousings, getTrips, getEvents, getTutors, type Housing, type Trip, type Event, type Tutor } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Bed, Car, GraduationCap, MapPin, PartyPopper } from 'lucide-react';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" />,
});

const ItemCard = ({ item, type }: { item: Housing | Trip | Event | Tutor; type: 'housing' | 'trip' | 'event' | 'tutor' }) => {
    switch (type) {
        case 'housing':
            const housing = item as Housing;
            return (
                <Card className="h-full">
                    <CardContent className="p-4">
                        <h3 className="font-bold">{housing.title}</h3>
                        <p className="text-sm text-muted-foreground">{housing.city}</p>
                        <p className="font-semibold text-primary mt-2">{housing.price}€/mois</p>
                    </CardContent>
                </Card>
            );
        case 'trip':
            const trip = item as Trip;
            return (
                 <Card className="h-full">
                    <CardContent className="p-4">
                        <h3 className="font-bold">{trip.departure} → {trip.arrival}</h3>
                        <p className="text-sm text-muted-foreground">Par {trip.driver}</p>
                        <p className="font-semibold text-primary mt-2">{trip.price}</p>
                    </CardContent>
                </Card>
            )
        // Cases for event and tutor can be added here
        default:
            return null;
    }
}


export default function Home() {
    const [mapItems, setMapItems] = useState<any[]>([]);
    const [mapItemType, setMapItemType] = useState<'housing' | 'trip' | 'event' | 'tutor' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'housing' | 'trip' | 'event' | 'tutor' | null>(null);

    const loadItems = async (type: 'housing' | 'trip' | 'event' | 'tutor') => {
        if (activeFilter === type) {
            // Deselect filter
            setActiveFilter(null);
            setMapItems([]);
            setMapItemType(null);
            return;
        }

        setIsLoading(true);
        setActiveFilter(type);
        let items = [];
        if (type === 'housing') {
            items = await getHousings();
        } else if (type === 'trip') {
            items = await getTrips();
        } else if (type === 'event') {
            items = await getEvents();
        } else if (type === 'tutor') {
            items = await getTutors();
        }
        setMapItems(items);
        setMapItemType(type);
        setIsLoading(false);
    }

  return (
    <div className="flex flex-col min-h-screen">
       <Navbar />
       <main className="flex-grow container mx-auto px-4 py-8">
            <Card>
                <CardContent className="p-2">
                    <div className="relative h-[60vh] min-h-[500px] w-full rounded-md overflow-hidden">
                        <MapView items={mapItems} itemType={mapItemType} />
                        <div className="absolute top-4 left-4 z-[1000] flex gap-2">
                             <Button onClick={() => loadItems('housing')} variant={activeFilter === 'housing' ? 'default' : 'secondary'} size="sm">
                                <Bed className="mr-2 h-4 w-4" /> Logements
                            </Button>
                             <Button onClick={() => loadItems('trip')} variant={activeFilter === 'trip' ? 'default' : 'secondary'} size="sm">
                                <Car className="mr-2 h-4 w-4" /> Covoiturages
                            </Button>
                            <Button onClick={() => loadItems('event')} variant={activeFilter === 'event' ? 'default' : 'secondary'} size="sm">
                                <PartyPopper className="mr-2 h-4 w-4" /> Événements
                            </Button>
                            <Button onClick={() => loadItems('tutor')} variant={activeFilter === 'tutor' ? 'default' : 'secondary'} size="sm">
                                <GraduationCap className="mr-2 h-4 w-4" /> Tuteurs
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <section id="features" className="py-16">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                      Explorez Nos Services
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                      Tout ce dont vous avez besoin pour une vie étudiante épanouie.
                    </p>
                </div>
                 <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <Button variant="outline" size="lg" className="h-auto py-6 flex-col gap-2" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
                        <Bed className="h-8 w-8 text-primary"/>
                        <span className="font-semibold">Logements</span>
                    </Button>
                    <Button variant="outline" size="lg" className="h-auto py-6 flex-col gap-2">
                        <Car className="h-8 w-8 text-primary"/>
                         <span className="font-semibold">Covoiturage</span>
                    </Button>
                     <Button variant="outline" size="lg" className="h-auto py-6 flex-col gap-2">
                        <GraduationCap className="h-8 w-8 text-primary"/>
                         <span className="font-semibold">Tutorat</span>
                    </Button>
                     <Button variant="outline" size="lg" className="h-auto py-6 flex-col gap-2">
                        <PartyPopper className="h-8 w-8 text-primary"/>
                        <span className="font-semibold">Événements</span>
                    </Button>
                </div>
            </section>
      </main>
      <Footer />
    </div>
  );
}
