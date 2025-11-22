
'use client';

import { useState, useMemo } from 'react';
import PostCard from "@/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, orderBy, query } from 'firebase/firestore';
import type { Post, Housing, Trip, Tutor, Event, UserProfile } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import CreatePostForm from '@/components/create-post-form';
import { PageSkeleton } from '@/components/page-skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Bed, Home, MapPin, Users, Star, GraduationCap, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const reelsUsers = [
  { name: "Alice", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=alice" },
  { name: "Bob", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=bob" },
  { name: "Charlie", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=charlie" },
  { name: "Diana", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=diana" },
  { name: "Eva", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=eva" },
  { name: "Frank", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=frank" },
  { name: "Grace", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=grace" },
];

function ReelsTray() {
  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-0 py-3 border-b md:border-x md:rounded-t-lg">
      <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
        {reelsUsers.map((user) => (
          <div key={user.name} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 group-hover:animate-pulse"></div>
              <Avatar className="h-16 w-16 border-2 border-background relative">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs truncate w-16 text-center">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ============== HOUSING CARD ==============
function HousingCardFeed({ item }: { item: Housing & { owner?: UserProfile } }) {
  const router = useRouter();
  const { user } = useUser();
  return (
    <Card className="rounded-none md:rounded-lg border-x-0 md:border-x">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="h-5 w-5 text-primary"/>
          <h3 className="font-semibold text-sm">Nouveau logement disponible</h3>
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
          <Badge className="absolute top-2 right-2">{item.type}</Badge>
        </div>
        <h4 className="font-bold text-lg">{item.title}</h4>
        <p className="text-sm text-muted-foreground flex items-center mt-1">
          <MapPin className="h-4 w-4 mr-1" />
          {item.city}
        </p>
        <div className="flex items-center text-sm text-muted-foreground gap-4 mt-2">
            <span className="flex items-center"><Bed className="h-4 w-4 mr-1"/> {item.bedrooms} ch.</span>
            <span className="flex items-center"><Home className="h-4 w-4 mr-1"/> {item.surface_area}m²</span>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-2xl font-bold text-primary">{item.price}€/mois</p>
          <Button onClick={() => user ? router.push('/housing') : router.push('/login?from=/housing')}>Voir les détails</Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============== TRIP CARD ==============
function TripCardFeed({ item }: { item: Trip & { owner?: UserProfile } }) {
   const router = useRouter();
   const { user } = useUser();
  return (
    <Card className="rounded-none md:rounded-lg border-x-0 md:border-x">
      <CardContent className="p-4">
         <div className="flex items-center gap-2 mb-3">
          <Car className="h-5 w-5 text-primary"/>
          <h3 className="font-semibold text-sm">Nouveau covoiturage proposé</h3>
        </div>
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary"/>
              <div>
                  <p className="font-medium text-sm text-muted-foreground">Départ</p>
                  <p className="font-semibold">{item.departureCity}</p>
              </div>
          </div>
           <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-secondary"/>
              <div>
                  <p className="font-medium text-sm text-muted-foreground">Arrivée</p>
                  <p className="font-semibold">{item.arrivalCity}</p>
              </div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
            <div>
                 <p className="font-semibold">{new Date(item.departureTime).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground">{new Date(item.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          <p className="text-2xl font-bold text-primary">{item.pricePerSeat}€/siège</p>
        </div>
        <Button className="w-full mt-4" onClick={() => user ? router.push('/carpooling') : router.push('/login?from=/carpooling')}>Voir les détails</Button>
      </CardContent>
    </Card>
  );
}

// ============== EVENT CARD ==============
function EventCardFeed({ item }: { item: Event }) {
   const router = useRouter();
   const { user } = useUser();
  return (
    <Card className="rounded-none md:rounded-lg border-x-0 md:border-x">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <PartyPopper className="h-5 w-5 text-primary"/>
          <h3 className="font-semibold text-sm">Nouvel événement</h3>
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
          <Badge className="absolute top-2 right-2">{item.category}</Badge>
        </div>
        <h4 className="font-bold text-lg">{item.title}</h4>
        <p className="text-sm text-muted-foreground flex items-center mt-1">
          <MapPin className="h-4 w-4 mr-1" />
          {item.city} - {new Date(item.startDate).toLocaleDateString()}
        </p>
        <Button className="w-full mt-4" onClick={() => user ? router.push('/events') : router.push('/login?from=/events')}>Voir les détails</Button>
      </CardContent>
    </Card>
  );
}

// ============== TUTORING CARD ==============
function TutorCardFeed({ item }: { item: Tutor }) {
  const router = useRouter();
  const { user } = useUser();
  return (
    <Card className="rounded-none md:rounded-lg border-x-0 md:border-x">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="h-5 w-5 text-primary"/>
          <h3 className="font-semibold text-sm">Nouveau tuteur disponible</h3>
        </div>
        <h4 className="font-bold text-lg">{item.subject}</h4>
        <p className="text-muted-foreground">{item.level}</p>
        <div className="flex items-center justify-center gap-1 text-yellow-500 mt-3">
            <Star className="h-5 w-5 fill-current" />
            <span className="font-bold text-base text-foreground">{item.rating?.toFixed(1) || 'N/A'}</span>
        </div>
        <p className="text-2xl font-bold text-primary text-center mt-2">{item.pricePerHour}€/h</p>
        <Button className="w-full mt-4" onClick={() => user ? router.push('/tutoring') : router.push('/login?from=/tutoring')}>Contacter</Button>
      </CardContent>
    </Card>
  )
}

const itemComponents = {
  post: PostCard,
  housing: HousingCardFeed,
  trip: TripCardFeed,
  event: EventCardFeed,
  tutor: TutorCardFeed,
};


export default function SocialPageContent() {
    const firestore = useFirestore();
    
    // Fetch all item types
    const postsQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')), [firestore]);
    const housingsQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'housings'), orderBy('createdAt', 'desc')), [firestore]);
    const tripsQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'carpoolings'), orderBy('createdAt', 'desc')), [firestore]);
    const tutorsQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'tutorings'), orderBy('createdAt', 'desc')), [firestore]);
    const eventsQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'events'), orderBy('createdAt', 'desc')), [firestore]);

    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);
    const { data: housings, isLoading: housingsLoading } = useCollection<Housing>(housingsQuery);
    const { data: trips, isLoading: tripsLoading } = useCollection<Trip>(tripsQuery);
    const { data: tutors, isLoading: tutorsLoading } = useCollection<Tutor>(tutorsQuery);
    const { data: events, isLoading: eventsLoading } = useCollection<Event>(eventsQuery);
    
    const [showCreateForm, setShowCreateForm] = useState(false);

    const combinedFeed = useMemo(() => {
        const allItems = [
            ...(posts || []).map(item => ({ ...item, itemType: 'post' as const, sortDate: item.createdAt })),
            ...(housings || []).map(item => ({ ...item, itemType: 'housing' as const, sortDate: item.createdAt })),
            ...(trips || []).map(item => ({ ...item, itemType: 'trip' as const, sortDate: item.createdAt })),
            ...(tutors || []).map(item => ({ ...item, itemType: 'tutor' as const, sortDate: item.createdAt })),
            ...(events || []).map(item => ({ ...item, itemType: 'event' as const, sortDate: item.createdAt })),
        ];

        // Sort by date, descending
        allItems.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime());
        
        return allItems;
    }, [posts, housings, trips, tutors, events]);
    
    const isLoading = postsLoading || housingsLoading || tripsLoading || tutorsLoading || eventsLoading;

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="flex flex-col min-h-screen">
             <main className="flex-grow container mx-auto px-0 md:px-4 pt-4">
                {showCreateForm && <CreatePostForm onClose={() => setShowCreateForm(false)} />}
                <div className="max-w-xl mx-auto">
                   {isLoading && <PageSkeleton />}
                   {!isLoading && combinedFeed && (
                     <>
                        <ReelsTray />
                        <div className="space-y-4 pt-4">
                            {combinedFeed.map(item => {
                                const Component = itemComponents[item.itemType];
                                // The key needs to be unique across all item types
                                const uniqueKey = `${item.itemType}-${item.id}`;
                                return Component ? <Component key={uniqueKey} post={item as any} item={item as any} /> : null;
                            })}
                        </div>
                     </>
                   )}
                </div>
            </main>
        </div>
    );
}

    