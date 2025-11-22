
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Bookmark, AtSign, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useUser, useAuth, useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import type { Post, UserProfile, Favorite } from '@/lib/types';
import EditProfileForm from '@/components/edit-profile-form';
import FollowListModal from '@/components/follow-list-modal';
import { collection, doc, query, where, documentId } from 'firebase/firestore';
import { toggleFollowUser } from '@/lib/social';
import { useToast } from '@/hooks/use-toast';

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
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
                    <Skeleton className="h-24 w-24 md:h-36 md:w-36 rounded-full flex-shrink-0" />
                    <div className="space-y-3 text-center sm:text-left">
                        <Skeleton className="h-6 w-40 mx-auto sm:mx-0" />
                        <div className="flex justify-center sm:justify-start gap-4">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-48 pt-2 mx-auto sm:mx-0" />
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
  
  // Fetch favorite items for the visited user
  const userFavoritesQuery = useMemoFirebase(() => {
      if (!profileId || !firestore) return null;
      return query(collection(firestore, 'favorites'), where('userId', '==', profileId), where('itemType', '==', 'post'));
  }, [profileId, firestore]);
  const { data: favoriteItems, isLoading: favoritesLoading } = useCollection<Favorite>(userFavoritesQuery);

  // Extract post IDs from favorites
  const savedPostIds = useMemo(() => {
      if (!favoriteItems) return [];
      return favoriteItems.map(fav => fav.itemId);
  }, [favoriteItems]);
  
  // Fetch the actual post documents based on the saved post IDs
  const savedPostsQuery = useMemoFirebase(() => {
      if (!firestore || savedPostIds.length === 0) return null;
      return query(collection(firestore, 'posts'), where(documentId(), 'in', savedPostIds));
  }, [firestore, savedPostIds]);
  const { data: savedPosts, isLoading: savedPostsLoading } = useCollection<Post>(savedPostsQuery);

  const handleFollow = async () => {
    if (!user || !firestore || !userProfile || !currentUserProfile) {
        toast({ title: "Erreur", description: "Vous devez être connecté pour suivre quelqu'un.", variant: "destructive"});
        return;
    }

    try {
        await toggleFollowUser(firestore, user.uid, userProfile.id, isFollowing);
        toast({ title: isFollowing ? "Ne plus suivre" : "Suivi", description: `Vous ${isFollowing ? 'ne suivez plus' : 'suivez maintenant'} ${userProfile.username}.`})
    } catch(error) {
        toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive"})
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
    return <ProfilePageSkeleton />;
  }
  
  const followersCount = userProfile?.followerIds?.length || 0;
  const followingCount = userProfile?.followingIds?.length || 0;
  const isFollowing = !!(currentUserProfile && currentUserProfile.followingIds?.includes(profileId));


  return (
    <>
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
                                                <Button variant="secondary" size="sm" onClick={() => router.push(`/messages?recipient=${profileId}`)}>
                                                    Message
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-center sm:justify-start gap-4 md:gap-8 text-sm">
                                    <p><span className="font-semibold">{userPosts?.length || 0}</span> publications</p>
                                    <button onClick={() => setModalContent({ title: "Abonnés", userIds: userProfile.followerIds || [] })} className="cursor-pointer hover:underline">
                                        <span className="font-semibold">{followersCount}</span> abonnés
                                    </button>
                                     <button onClick={() => setModalContent({ title: "Abonnements", userIds: userProfile.followingIds || [] })} className="cursor-pointer hover:underline">
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
                            title={modalContent.title}
                            userIds={modalContent.userIds}
                            onClose={() => setModalContent(null)}
                        />
                    )}


                    <Tabs defaultValue="posts" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 rounded-none border-y">
                            <TabsTrigger value="posts" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                                <Grid3x3 className="h-5 w-5" />
                                <span className="hidden md:inline ml-2">Publications</span>
                            </TabsTrigger>
                            <TabsTrigger value="saved" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                                <Bookmark className="h-5 w-5" />
                                <span className="hidden md:inline ml-2">Enregistrés</span>
                            </TabsTrigger>
                            <TabsTrigger value="tagged" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                                <AtSign className="h-5 w-5" />
                                <span className="hidden md:inline ml-2">Mentions</span>
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
                        <TabsContent value="saved">
                            {(savedPostsLoading || favoritesLoading) ? (
                                <div className="grid grid-cols-3 gap-1 mt-1">
                                    <Skeleton className="aspect-square" />
                                    <Skeleton className="aspect-square" />
                                    <Skeleton className="aspect-square" />
                                </div>
                             ) : savedPosts && savedPosts.length > 0 ? (
                                <ProfileGrid posts={savedPosts} />
                             ) : (
                                <div className="text-center p-10">
                                    <h3 className="text-lg font-semibold">Aucun enregistrement</h3>
                                    <p className="text-muted-foreground text-sm">Les publications enregistrées par cet utilisateur apparaîtront ici.</p>
                                </div>
                             )}
                        </TabsContent>
                        <TabsContent value="tagged">
                            <div className="text-center p-10">
                                <h3 className="text-lg font-semibold">Photos de cet utilisateur</h3>
                                <p className="text-muted-foreground text-sm">Lorsque des personnes mentionnent cet utilisateur dans des photos, elles apparaissent ici.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
          </div>
    </>
  );
}
