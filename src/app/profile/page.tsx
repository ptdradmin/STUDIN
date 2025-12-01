
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Bookmark, LogOut, Search, Package, CalendarClock, Car, Bed, BookOpen, PartyPopper } from 'lucide-react';
import Image from 'next/image';
import { useUser, useAuth, useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import type { Post, UserProfile, Favorite, Housing, Trip, Tutor, Event, CarpoolBooking } from '@/lib/types';
import EditProfileForm from '@/components/edit-profile-form';
import FollowListModal from '@/components/follow-list-modal';
import { collection, doc, query, where, documentId, getDocs } from 'firebase/firestore';
import SocialSidebar from '@/components/social-sidebar';
import UserSearch from '@/components/user-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

const ProfileGrid = ({ posts, isLoading }: { posts: Post[], isLoading?: boolean }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-3 gap-1 mt-1">
                <Skeleton className="aspect-square" />
                <Skeleton className="aspect-square" />
                <Skeleton className="aspect-square" />
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="text-center p-10">
                <h3 className="text-lg font-semibold">Aucune publication</h3>
                <p className="text-muted-foreground text-sm">Les publications apparaîtront ici.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-3 gap-1">
            {posts.map(post => (
                <div key={post.id} className="relative aspect-square bg-muted">
                    {post.imageUrl && (
                        <Image 
                            src={post.imageUrl}
                            alt="User post"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 33vw, 25vw"
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

const MyListings = ({ user }: { user: import('firebase/auth').User }) => {
    const firestore = useFirestore();

    const housingQuery = useMemoFirebase(() => query(collection(firestore!, 'housings'), where('userId', '==', user.uid)), [firestore, user.uid]);
    const carpoolQuery = useMemoFirebase(() => query(collection(firestore!, 'carpoolings'), where('driverId', '==', user.uid)), [firestore, user.uid]);
    const tutorQuery = useMemoFirebase(() => query(collection(firestore!, 'tutorings'), where('tutorId', '==', user.uid)), [firestore, user.uid]);
    const eventQuery = useMemoFirebase(() => query(collection(firestore!, 'events'), where('organizerId', '==', user.uid)), [firestore, user.uid]);

    const { data: housings, isLoading: l1 } = useCollection<Housing>(housingQuery);
    const { data: carpools, isLoading: l2 } = useCollection<Trip>(carpoolQuery);
    const { data: tutorings, isLoading: l3 } = useCollection<Tutor>(tutorQuery);
    const { data: events, isLoading: l4 } = useCollection<Event>(eventQuery);

    const isLoading = l1 || l2 || l3 || l4;
    const allListings = [...(housings || []), ...(carpools || []), ...(tutorings || []), ...(events || [])];

    if(isLoading) return <div className="p-4"><Skeleton className="h-24 w-full" /></div>
    if (allListings.length === 0) return <div className="text-center p-10"><p className="text-muted-foreground">Vous n'avez aucune annonce active.</p></div>

    return (
        <div className="space-y-4 p-4">
            {housings?.map(h => (
                <Link href="/housing" key={h.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Bed className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Logement</p>
                                <p className="font-semibold">{h.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
            {carpools?.map(c => (
                 <Link href="/carpooling" key={c.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Car className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Covoiturage</p>
                                <p className="font-semibold">{c.departureCity} à {c.arrivalCity}</p>
                            </div>
                        </CardContent>
                    </Card>
                 </Link>
            ))}
            {tutorings?.map(t => (
                <Link href="/tutoring" key={t.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <BookOpen className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Tutorat</p>
                                <p className="font-semibold">{t.subject}</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
            {events?.map(e => (
                 <Link href="/events" key={e.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <PartyPopper className="h-5 w-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Événement</p>
                                <p className="font-semibold">{e.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

const MyActivities = ({ user }: { user: import('firebase/auth').User }) => {
    const firestore = useFirestore();
    
    const carpoolBookingsQuery = useMemoFirebase(() => 
        !firestore ? null : query(collection(firestore, 'carpoolings'), where('passengerIds', 'array-contains', user.uid)),
        [firestore, user.uid]
    );
    const { data: bookedCarpools, isLoading: l1 } = useCollection<Trip>(carpoolBookingsQuery);
    
    const attendedEventsQuery = useMemoFirebase(() =>
        !firestore ? null : query(collection(firestore, 'events'), where('attendeeIds', 'array-contains', user.uid)),
        [firestore, user.uid]
    );
    const { data: attendedEvents, isLoading: l2 } = useCollection<Event>(attendedEventsQuery);


    const isLoading = l1 || l2;
    
    if (isLoading) return <div className="p-4"><Skeleton className="h-24 w-full" /></div>
    if (!isLoading && bookedCarpools?.length === 0 && attendedEvents?.length === 0) return <div className="text-center p-10"><p className="text-muted-foreground">Vous n'avez aucune activité à venir.</p></div>

    return (
        <div className="space-y-4 p-4">
            {bookedCarpools?.map(c => (
                <Link href="/carpooling" key={c.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Car className="h-5 w-5 text-secondary-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Covoiturage réservé</p>
                                <p className="font-semibold">{c.departureCity} à {c.arrivalCity}</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
            {attendedEvents?.map(e => (
                 <Link href="/events" key={e.id}>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                           <PartyPopper className="h-5 w-5 text-secondary-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Événement</p>
                                <p className="font-semibold">{e.title}</p>
                            </div>
                        </CardContent>
                    </Card>
                 </Link>
            ))}
        </div>
    )
}


function ProfilePageSkeleton() {
    return (
        <div className="mx-auto max-w-4xl">
            <div className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
                    <Skeleton className="h-24 w-24 md:h-36 md:w-36 rounded-full flex-shrink-0" />
                    <div className="space-y-4 text-center sm:text-left w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                           <Skeleton className="h-6 w-32" />
                           <div className="flex items-center gap-2">
                                <Skeleton className="h-9 w-28" />
                                <Skeleton className="h-9 w-12" />
                           </div>
                        </div>
                        <div className="flex justify-center sm:justify-start gap-4 md:gap-8 text-sm">
                           <Skeleton className="h-5 w-20" />
                           <Skeleton className="h-5 w-20" />
                           <Skeleton className="h-5 w-24" />
                        </div>
                        <div className="space-y-2">
                             <Skeleton className="h-5 w-24 mx-auto sm:mx-0" />
                             <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
                             <Skeleton className="h-4 w-48 mx-auto sm:mx-0" />
                        </div>
                    </div>
                </div>
            </div>
             <div className="mt-8">
                <Skeleton className="h-10 w-full" />
                 <div className="grid grid-cols-3 gap-1 mt-1">
                    <Skeleton className="aspect-square" />
                    <Skeleton className="aspect-square" />
                    <Skeleton className="aspect-square" />
                </div>
            </div>
        </div>
    );
}

export default function CurrentUserProfilePage() {
  const { user, isUserLoading } = useUser();
  const { auth, firestore } = useAuth();
  const router = useRouter();

  const [showEditForm, setShowEditForm] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, userIds: string[]} | null>(null);

  const userRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userRef);

  const userPostsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'posts'), where('userId', '==', user.uid));
  }, [firestore, user]);
  const { data: userPosts, isLoading: postsLoading } = useCollection<Post>(userPostsQuery);

  const userFavoritesQuery = useMemoFirebase(() => {
      if (!user || !firestore) return null;
      return query(collection(firestore, `users/${user.uid}/favorites`), where('itemType', '==', 'post'));
  }, [user, firestore]);
  const { data: favoriteItems, isLoading: favoritesLoading } = useCollection<Favorite>(userFavoritesQuery);

  const savedPostIds = useMemo(() => {
      if (!favoriteItems) return [];
      const postIds = favoriteItems.filter(f => f.itemType === 'post').map(fav => fav.itemId);
      return postIds;
  }, [favoriteItems]);

  const savedPostsQuery = useMemoFirebase(() => {
    if (!firestore || savedPostIds.length === 0) return null;
    // Firestore 'in' queries are limited to 30 documents. For this app, we'll cap it.
    const safePostIds = savedPostIds.length > 30 ? savedPostIds.slice(0, 30) : savedPostIds;
    return query(collection(firestore, 'posts'), where(documentId(), 'in', safePostIds));
  }, [firestore, savedPostIds]);
  const { data: savedPosts, isLoading: savedPostsLoading } = useCollection<Post>(savedPostsQuery);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?from=/profile');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if(auth) {
        await signOut(auth);
        router.push('/');
    }
  }
  
  const getInitials = (email?: string | null) => {
    if (!email) return '..';
    const parts = email.split('@')[0].replace('.', ' ').split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  const loading = isUserLoading || postsLoading || profileLoading;

  const followersCount = userProfile?.followerIds?.length || 0;
  const followingCount = userProfile?.followingIds?.length || 0;

  return (
    <div className="flex min-h-screen w-full bg-background">
        <SocialSidebar />
        <div className="flex flex-col flex-1">
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
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto px-4 py-8">
                    {loading || !user || !userProfile ? <ProfilePageSkeleton /> : (
                        <div className="mx-auto max-w-4xl">
                            <div className="p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
                                    <Avatar className="h-24 w-24 md:h-36 md:w-36 flex-shrink-0">
                                        <AvatarImage src={userProfile.profilePicture || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`} />
                                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-4 text-center sm:text-left">
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <h2 className="text-2xl font-light">{userProfile?.username || user.email?.split('@')[0]}</h2>
                                            <div className="flex items-center gap-2">
                                                <Button variant="secondary" size="sm" onClick={() => setShowEditForm(true)}>Modifier le profil</Button>
                                                <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9">
                                                    <LogOut className="h-4 w-4"/>
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-center sm:justify-start gap-4 md:gap-8 text-sm">
                                            <p><span className="font-semibold">{userPosts?.length || 0}</span> publications</p>
                                            <button onClick={() => setModalContent({ title: "Abonnés", userIds: userProfile.followerIds || [] })} className="cursor-pointer hover:underline" disabled={(userProfile.followerIds || []).length === 0}>
                                                <span className="font-semibold">{followersCount}</span> abonnés
                                            </button>
                                            <button onClick={() => setModalContent({ title: "Abonnements", userIds: userProfile.followingIds || [] })} className="cursor-pointer hover:underline" disabled={(userProfile.followingIds || []).length === 0}>
                                                <span className="font-semibold">{followingCount}</span> abonnements
                                            </button>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{userProfile?.firstName} {userProfile?.lastName}</p>
                                            <p className="text-muted-foreground text-sm">{userProfile?.university || 'Université non spécifiée'}</p>
                                            <p className="text-sm mt-1">{userProfile?.bio}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {showEditForm && userProfile && (
                                <EditProfileForm 
                                    user={user}
                                    userProfile={userProfile}
                                    onClose={() => setShowEditForm(false)}
                                />
                            )}
                            
                            {modalContent && (
                                <FollowListModal
                                    key={modalContent.title + modalContent.userIds.length}
                                    title={modalContent.title}
                                    userIds={modalContent.userIds}
                                    onClose={() => setModalContent(null)}
                                />
                            )}


                            <Tabs defaultValue="posts" className="w-full">
                                <TabsList className="grid w-full grid-cols-4 rounded-none border-y">
                                    <TabsTrigger value="posts" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                                        <Grid3x3 className="h-5 w-5" />
                                        <span className="hidden md:inline ml-2">Publications</span>
                                    </TabsTrigger>
                                     <TabsTrigger value="listings" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                                        <Package className="h-5 w-5" />
                                        <span className="hidden md:inline ml-2">Mes Annonces</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="activities" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                                        <CalendarClock className="h-5 w-5" />
                                        <span className="hidden md:inline ml-2">Mes Activités</span>
                                    </TabsTrigger>
                                    <TabsTrigger value="saved" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                                        <Bookmark className="h-5 w-5" />
                                        <span className="hidden md:inline ml-2">Enregistrés</span>
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="posts">
                                <ProfileGrid posts={userPosts || []} isLoading={postsLoading} />
                                </TabsContent>
                                <TabsContent value="listings">
                                    <MyListings user={user} />
                                </TabsContent>
                                <TabsContent value="activities">
                                    <MyActivities user={user} />
                                </TabsContent>
                                <TabsContent value="saved">
                                    {(savedPostsLoading || favoritesLoading) ? (
                                        <ProfileGrid posts={[]} isLoading={true} />
                                    ) : savedPosts && savedPosts.length > 0 ? (
                                        <ProfileGrid posts={savedPosts} />
                                    ) : (
                                        <div className="text-center p-10">
                                            <h3 className="text-lg font-semibold">Aucun enregistrement</h3>
                                            <p className="text-muted-foreground text-sm">Les publications que vous enregistrez apparaîtront ici.</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </div>
            </main>
        </div>
    </div>
  );
}

    

    

