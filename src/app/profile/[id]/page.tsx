
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Search } from 'lucide-react';
import Image from 'next/image';
import { useUser, useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Post, UserProfile } from '@/lib/types';
import FollowListModal from '@/components/follow-list-modal';
import { collection, doc, query, where } from 'firebase/firestore';
import { toggleFollowUser } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import SocialSidebar from '@/components/social-sidebar';
import UserSearch from '@/components/user-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { getOrCreateConversation } from '@/lib/conversations';


const ProfileGrid = ({ posts }: { posts: Post[] }) => (
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
                                <Skeleton className="h-9 w-24" />
                                <Skeleton className="h-9 w-24" />
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

export default function UserProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const profileId = params.id as string;

  const [modalContent, setModalContent] = useState<{title: string, userIds: string[]} | null>(null);

  const userRef = useMemoFirebase(() => {
    if (!profileId || !firestore) return null;
    return doc(firestore, 'users', profileId);
  }, [profileId, firestore]);
  const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userRef);

  const userPostsQuery = useMemoFirebase(() => {
    if (!firestore || !profileId) return null;
    return query(collection(firestore, 'posts'), where('userId', '==', profileId));
  }, [firestore, profileId]);
  const { data: userPosts, isLoading: postsLoading } = useCollection<Post>(userPostsQuery);

  const { data: currentUserProfile } = useDoc<UserProfile>(
    useMemoFirebase(() => user && firestore ? doc(firestore, 'users', user.uid) : null, [user, firestore])
  );
  

  const handleFollow = async () => {
    if (!user || !firestore || !userProfile || !currentUserProfile) {
        toast({ title: "Erreur", description: "Vous devez être connecté pour suivre quelqu'un.", variant: "destructive"});
        return;
    }

    const wasFollowing = isFollowing;
    try {
        await toggleFollowUser(firestore, user.uid, userProfile.id, wasFollowing);
        toast({ title: wasFollowing ? "Ne plus suivre" : "Suivi", description: `Vous ${wasFollowing ? 'ne suivez plus' : 'suivez maintenant'} ${userProfile.username}.`})
    } catch(error) {
        toast({ title: "Erreur", description: "Une erreur est survenue lors de la tentative de suivi.", variant: "destructive"})
    }
  }

  const handleMessage = async () => {
    if (!user || !firestore) {
        router.push('/login');
        return;
    }
    if (!userProfile) return;
    
    if (user.uid === userProfile.id) {
        toast({title: "Action impossible", description: "Vous ne pouvez pas vous envoyer de message à vous-même."});
        return;
    }

    const conversationId = await getOrCreateConversation(firestore, user.uid, userProfile.id);
    if (conversationId) {
        router.push(`/messages/${conversationId}`);
    } else {
        toast({ title: "Erreur", description: "Impossible de démarrer la conversation.", variant: "destructive" });
    }
  }
  
  const getInitials = (firstName?: string) => {
    if (!firstName) return '..';
    return firstName.substring(0, 2).toUpperCase();
  }

  const loading = isUserLoading || postsLoading || profileLoading;
  const isCurrentUserProfile = user && user.uid === profileId;

  if (isCurrentUserProfile) {
    router.replace('/profile');
    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex flex-col flex-1">
                <main className="flex-1 overflow-y-auto p-4 md:p-6"><ProfilePageSkeleton /></main>
            </div>
        </div>
    );
  }
  
  const followersCount = userProfile?.followerIds?.length || 0;
  const followingCount = userProfile?.followingIds?.length || 0;
  const isFollowing = !!(currentUserProfile && currentUserProfile.followingIds?.includes(profileId));


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
                    {loading || !userProfile ? <ProfilePageSkeleton /> : (
                        <div className="mx-auto max-w-4xl">
                            <div className="p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
                                    <Avatar className="h-24 w-24 md:h-36 md:w-36 flex-shrink-0">
                                        <AvatarImage src={userProfile.profilePicture || `https://api.dicebear.com/7.x/micah/svg?seed=${userProfile.email}`} />
                                        <AvatarFallback>{getInitials(userProfile.firstName)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-4 text-center sm:text-left">
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            <h2 className="text-2xl font-light">{userProfile.username}</h2>
                                            <div className="flex items-center gap-2">
                                                {user && (
                                                    <>
                                                        <Button variant={isFollowing ? "secondary" : "default"} size="sm" onClick={handleFollow}>
                                                            {isFollowing ? 'Ne plus suivre' : 'Suivre'}
                                                        </Button>
                                                        <Button variant="secondary" size="sm" onClick={handleMessage}>
                                                            Message
                                                        </Button>
                                                    </>
                                                )}
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
                                            <p className="font-semibold">{userProfile.firstName} {userProfile.lastName}</p>
                                            <p className="text-muted-foreground text-sm">{userProfile.university || 'Université non spécifiée'}</p>
                                            <p className="text-sm mt-1">{userProfile.bio}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {modalContent && (
                                <FollowListModal
                                    key={modalContent.title + profileId}
                                    title={modalContent.title}
                                    userIds={modalContent.userIds}
                                    onClose={() => setModalContent(null)}
                                />
                            )}


                            <Tabs defaultValue="posts" className="w-full">
                                <TabsList className="grid w-full grid-cols-1 rounded-none border-y">
                                    <TabsTrigger value="posts" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                                        <Grid3x3 className="h-5 w-5" />
                                        <span className="hidden md:inline ml-2">Publications</span>
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="posts">
                                    {userPosts && userPosts.length > 0 ? <ProfileGrid posts={userPosts} /> : (
                                        <div className="text-center p-10">
                                            <h3 className="text-lg font-semibold">Aucune publication</h3>
                                            <p className="text-muted-foreground text-sm">Cet utilisateur n'a encore rien publié.</p>
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

    

    