

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Bookmark, LogOut, Search, Package, CalendarClock, Car, Bed, BookOpen, PartyPopper, BadgeCheck } from 'lucide-react';
import Image from 'next/image';
import { useUser, useAuth, useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import type { Post, UserProfile, Favorite, Housing, Trip, Tutor, Event, Book } from '@/lib/types';
import EditProfileForm from '@/components/edit-profile-form';
import FollowListModal from '@/components/follow-list-modal';
import { collection, doc, query, where, documentId, getDocs, limit } from 'firebase/firestore';
import SocialSidebar from '@/components/social-sidebar';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import HousingCard from '@/components/housing-card';
import { toggleFavorite } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import ProfileListingsTab from '@/components/profile-listings-tab';
import { generateAvatar } from '@/lib/avatars';

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

    if (isLoading) return <div className="p-4"><Skeleton className="h-24 w-full" /></div>
    if (allListings.length === 0) return <div className="text-center p-10"><p className="text-muted-foreground">Vous n'avez aucune annonce active.</p></div>

    return (
        <div className="p-4">
            <ProfileListingsTab
                housings={housings}
                carpools={carpools}
                tutorings={tutorings}
                events={events}
                isLoading={isLoading}
            />
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
    const { auth } = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [showEditForm, setShowEditForm] = useState(false);
    const [modalContent, setModalContent] = useState<{ title: string, userIds: string[] } | null>(null);

    const userRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, isLoading: profileLoading, error } = useDoc<UserProfile>(userRef);

    const userPostsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'posts'), where('userId', '==', user.uid), limit(30));
    }, [firestore, user]);
    const { data: userPosts, isLoading: postsLoading } = useCollection<Post>(userPostsQuery);

    const userFavoritesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/favorites`), limit(50));
    }, [user, firestore]);
    const { data: favoriteItems, isLoading: favoritesLoading } = useCollection<Favorite>(userFavoritesQuery);

    const favoritedIds = useMemo(() => {
        const ids: { [key in Favorite['itemType']]?: Set<string> } = { housing: new Set(), event: new Set(), tutor: new Set(), post: new Set(), book: new Set() };
        favoriteItems?.forEach(fav => {
            if (ids[fav.itemType]) {
                ids[fav.itemType]!.add(fav.itemId);
            }
        });
        return ids;
    }, [favoriteItems]);

    const savedPostsQuery = useMemoFirebase(() => {
        if (!firestore || !favoritedIds.post || favoritedIds.post.size === 0) return null;
        return query(collection(firestore, 'posts'), where(documentId(), 'in', Array.from(favoritedIds.post).slice(0, 30)));
    }, [firestore, favoritedIds.post]);
    const { data: savedPosts, isLoading: savedPostsLoading } = useCollection<Post>(savedPostsQuery);

    const savedHousingsQuery = useMemoFirebase(() => {
        if (!firestore || !favoritedIds.housing || favoritedIds.housing.size === 0) return null;
        return query(collection(firestore, 'housings'), where(documentId(), 'in', Array.from(favoritedIds.housing).slice(0, 30)));
    }, [firestore, favoritedIds.housing]);
    const { data: savedHousings, isLoading: savedHousingsLoading } = useCollection<Housing>(savedHousingsQuery);

    const savedEventsQuery = useMemoFirebase(() => {
        if (!firestore || !favoritedIds.event || favoritedIds.event.size === 0) return null;
        return query(collection(firestore, 'events'), where(documentId(), 'in', Array.from(favoritedIds.event).slice(0, 30)));
    }, [firestore, favoritedIds.event]);
    const { data: savedEvents, isLoading: savedEventsLoading } = useCollection<Event>(savedEventsQuery);

    const savedTutorsQuery = useMemoFirebase(() => {
        if (!firestore || !favoritedIds.tutor || favoritedIds.tutor.size === 0) return null;
        return query(collection(firestore, 'tutorings'), where(documentId(), 'in', Array.from(favoritedIds.tutor).slice(0, 30)));
    }, [firestore, favoritedIds.tutor]);
    const { data: savedTutors, isLoading: savedTutorsLoading } = useCollection<Tutor>(savedTutorsQuery);

    const savedBooksQuery = useMemoFirebase(() => {
        if (!firestore || !favoritedIds.book || favoritedIds.book.size === 0) return null;
        return query(collection(firestore, 'books'), where(documentId(), 'in', Array.from(favoritedIds.book).slice(0, 30)));
    }, [firestore, favoritedIds.book]);
    const { data: savedBooks, isLoading: savedBooksLoading } = useCollection<Book>(savedBooksQuery);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login?from=/profile');
        }
    }, [user, isUserLoading, router]);

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
            router.push('/');
        }
    }

    const handleToggleFavorite = async (item: { id: string, type: Favorite['itemType'] }) => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Vous devez être connecté.' });
            return;
        }
        const isFavorited = favoriteItems?.some(fav => fav.itemId === item.id) || false;
        try {
            await toggleFavorite(firestore, user.uid, item, isFavorited);
            toast({ title: isFavorited ? 'Retiré des favoris' : 'Ajouté aux favoris' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour les favoris.' });
        }
    };

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

    const savedItemsLoading = savedPostsLoading || savedHousingsLoading || savedEventsLoading || savedTutorsLoading || savedBooksLoading;
    const totalSavedItems = (favoritedIds.post?.size || 0) + (favoritedIds.housing?.size || 0) + (favoritedIds.event?.size || 0) + (favoritedIds.tutor?.size || 0) + (favoritedIds.book?.size || 0);

    if (error) {
        return (
            <div className="flex min-h-screen w-full bg-background">
                <SocialSidebar />
                <div className="flex flex-col flex-1 items-center justify-center p-4">
                    <div className="text-center space-y-4">
                        <h2 className="text-xl font-bold text-destructive">Erreur de chargement</h2>
                        <p className="text-muted-foreground">{error.message}</p>
                        <p className="text-sm text-muted-foreground">Vérifiez vos règles de sécurité Firebase (Firestore Rules).</p>
                        <Button onClick={() => window.location.reload()}>Réessayer</Button>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex min-h-screen w-full bg-background">
                <SocialSidebar />
                <div className="flex flex-col flex-1">
                    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <Skeleton className="h-10 w-full max-w-md" />
                        <div className="flex items-center gap-2"><Skeleton className="h-9 w-9 rounded-full" /></div>
                    </header>
                    <main className="flex-1 overflow-y-auto"><ProfilePageSkeleton /></main>
                </div>
            </div>
        )
    }

    if (!user || !userProfile) {
        return (
            <div className="flex min-h-screen w-full bg-background">
                <SocialSidebar />
                <div className="flex flex-col flex-1 items-center justify-center p-4">
                    <div className="text-center space-y-4">
                        <h2 className="text-xl font-bold">Profil introuvable</h2>
                        <p className="text-muted-foreground">Votre profil utilisateur n'a pas pu être chargé.</p>
                        <Button onClick={() => window.location.reload()}>Réessayer</Button>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex flex-col flex-1">
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
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto px-4 py-8">
                        <div className="mx-auto max-w-4xl">
                            <div className="p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
                                    <Avatar className="h-24 w-24 md:h-36 md:w-36 flex-shrink-0">
                                        <AvatarImage src={userProfile.profilePicture || generateAvatar(user.email || user.uid)} />
                                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-4 text-center sm:text-left">
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-2xl font-light">{userProfile?.username || user.email?.split('@')[0]}</h2>
                                                {userProfile.isVerified && <BadgeCheck className="h-6 w-6 text-primary" />}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="secondary" size="sm" onClick={() => setShowEditForm(true)}>Modifier le profil</Button>
                                                <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9">
                                                    <LogOut className="h-4 w-4" />
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
                                <TabsContent value="saved" className="p-4">
                                    {savedItemsLoading ? (
                                        <div className="space-y-4">
                                            <Skeleton className="h-24 w-full" />
                                            <Skeleton className="h-24 w-full" />
                                        </div>
                                    ) : (
                                        totalSavedItems === 0 ? (
                                            <div className="text-center py-10">
                                                <h3 className="text-lg font-semibold">Aucun enregistrement</h3>
                                                <p className="text-muted-foreground text-sm">Les éléments que vous enregistrez apparaîtront ici.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-6">
                                                {savedHousings && savedHousings.length > 0 && (
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Logements</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {savedHousings.map(h => <HousingCard key={h.id} housing={h} onEdit={() => { }} isFavorited={favoritedIds.housing?.has(h.id)} />)}
                                                        </div>
                                                    </div>
                                                )}
                                                {savedBooks && savedBooks.length > 0 && (
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Livres</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {savedBooks.map(b => (
                                                                <Link href={`/books`} key={b.id}>
                                                                    <Card className="hover:bg-muted/50 transition-colors">
                                                                        <CardContent className="p-4 flex items-center gap-4">
                                                                            <BookOpen className="h-5 w-5 text-primary" />
                                                                            <div><p className="font-semibold">{b.title}</p></div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {savedEvents && savedEvents.length > 0 && (
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Événements</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {savedEvents.map(e => (
                                                                <Link href={`/events`} key={e.id}>
                                                                    <Card className="hover:bg-muted/50 transition-colors">
                                                                        <CardContent className="p-4 flex items-center gap-4">
                                                                            <PartyPopper className="h-5 w-5 text-primary" />
                                                                            <div><p className="font-semibold">{e.title}</p></div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {savedTutors && savedTutors.length > 0 && (
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Tuteurs</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {savedTutors.map(t => (
                                                                <Link href={`/tutoring/${t.id}`} key={t.id}>
                                                                    <Card className="hover:bg-muted/50 transition-colors">
                                                                        <CardContent className="p-4 flex items-center gap-4">
                                                                            <BookOpen className="h-5 w-5 text-primary" />
                                                                            <div><p className="font-semibold">{t.subject} par {t.username}</p></div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {savedPosts && savedPosts.length > 0 && (
                                                    <div>
                                                        <h3 className="font-semibold mb-2">Publications</h3>
                                                        <div className="columns-2 md:columns-3 gap-4 space-y-4">
                                                            {savedPosts.map(p => (
                                                                <div key={p.id} className="break-inside-avoid">
                                                                    <Image src={p.imageUrl!} alt={p.caption} width={300} height={300} className="rounded-lg w-full h-auto" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
