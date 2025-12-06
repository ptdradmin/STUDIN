

'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Bookmark, LogOut, Search, Package, CalendarClock, Car, Bed, BookOpen, PartyPopper, BadgeCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useUser, useAuth, useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import type { Post, UserProfile, Housing, Trip, Tutor, Event, Favorite, Book } from '@/lib/types';
import EditProfileForm from '@/components/edit-profile-form';
import FollowListModal from '@/components/follow-list-modal';
import { collection, doc, query, where, limit, orderBy, QueryDocumentSnapshot, documentId } from 'firebase/firestore';
import SocialSidebar from '@/components/social-sidebar';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { generateAvatar, getInitials } from '@/lib/avatars';
import ProfileGrid from '@/components/profile-grid';
import MyListings from '@/components/my-listings';
import MyActivities from '@/components/my-activities';
import MySavedItems from '@/components/my-saved-items';


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

    const [showEditForm, setShowEditForm] = useState(false);
    const [modalContent, setModalContent] = useState<{ title: string, userIds: string[] } | null>(null);
    const [activeTab, setActiveTab] = useState('posts');
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const userRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, isLoading: profileLoading, error } = useDoc<UserProfile>(userRef);

    const userPostsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'posts'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(12)
        );
    }, [firestore, user]);
    const { data: userPosts, isLoading: postsLoading } = useCollection<Post>(userPostsQuery);

    const handleLoadMore = useCallback(async () => {
        if (!firestore || !user || !userPosts || userPosts.length === 0 || isLoadingMore) return;
        setIsLoadingMore(true);
        // This is a simplified version for now.
        setIsLoadingMore(false);
    }, [firestore, user, userPosts, isLoadingMore]);

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
    
    const isLoading = isUserLoading || profileLoading;

    const followersCount = userProfile?.followerIds?.length || 0;
    const followingCount = userProfile?.followingIds?.length || 0;

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

    if (isLoading) {
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


                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                                    <ProfileGrid
                                        posts={userPosts || []}
                                        isLoading={postsLoading}
                                        hasMore={userPosts && userPosts.length >= 12}
                                        onLoadMore={handleLoadMore}
                                        isLoadingMore={isLoadingMore}
                                    />
                                </TabsContent>
                                <TabsContent value="listings">
                                    <MyListings user={user} isActive={activeTab === 'listings'} />
                                </TabsContent>
                                <TabsContent value="activities">
                                    <MyActivities user={user} isActive={activeTab === 'activities'} />
                                </TabsContent>
                                <TabsContent value="saved">
                                    <MySavedItems user={user} isActive={activeTab === 'saved'} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

    
