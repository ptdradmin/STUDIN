

'use client';

import { collection, query, orderBy, limit, where, startAfter, getDocs, QueryDocumentSnapshot, DocumentData, serverTimestamp, setDoc } from 'firebase/firestore';
import type { Post, Favorite, UserProfile } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc, setDocumentNonBlocking } from '@/firebase';
import { PageSkeleton, CardSkeleton } from '@/components/page-skeleton';
import PostCard from '@/components/post-card';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import CreatePostForm from '@/components/create-post-form';
import NotificationsDropdown from '@/components/notifications-dropdown';
import GlobalSearch from '@/components/global-search';
import SocialSidebar from '@/components/social-sidebar';
import SuggestedUsersCarousel from '@/components/suggested-users-carousel';
import SocialFeedSuggestions from '@/components/social-feed-suggestions';
import { doc } from 'firebase/firestore';
import { generateAvatar } from '@/lib/avatars';

const POST_BATCH_SIZE = 10;

export default function SocialPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const [showCreatePost, setShowCreatePost] = useState(false);
    
    const [posts, setPosts] = useState<Post[]>([]);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);


    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: currentUserProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    const userFavoritesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, `users/${user.uid}/favorites`), where('itemType', '==', 'post'));
    }, [firestore, user]);
    const { data: favoriteItems } = useCollection<Favorite>(userFavoritesQuery);
    
    const savedPostMap = useMemo(() => {
        const map = new Map<string, string>();
        if (favoriteItems) {
            favoriteItems.forEach(fav => {
                map.set(fav.itemId, fav.id);
            });
        }
        return map;
    }, [favoriteItems]);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login?from=/social');
        }
    }, [isUserLoading, user, router]);

    useEffect(() => {
        if (user && !profileLoading && !currentUserProfile && firestore) {
            // This is a new user, create their profile document
            const userDocRef = doc(firestore, 'users', user.uid);
            const username = user.displayName?.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.]/g, '') || user.email?.split('@')[0] || `user_${user.uid.substring(0,5)}`;
            const userData: UserProfile = {
                id: user.uid,
                role: 'student', // Default role
                email: user.email!,
                username: username,
                firstName: user.displayName?.split(' ')[0] || '',
                lastName: user.displayName?.split(' ')[1] || '',
                university: '',
                fieldOfStudy: '',
                postalCode: '',
                city: '',
                bio: '',
                website: '',
                profilePicture: user.photoURL || generateAvatar(user.email || user.uid),
                followerIds: [],
                followingIds: [],
                isVerified: false,
                points: 0,
                challengesCompleted: 0,
                createdAt: serverTimestamp() as any,
                updatedAt: serverTimestamp() as any,
            };
            setDocumentNonBlocking(userDocRef, userData, { merge: false });
        }
    }, [user, profileLoading, currentUserProfile, firestore]);
    
    useEffect(() => {
        if (profileLoading || !firestore) return;

        const fetchInitialPosts = async () => {
            setIsLoadingInitial(true);
            setHasMore(true);

            let initialQuery;
            if (!user || !currentUserProfile?.followingIds || currentUserProfile.followingIds.length === 0) {
              // Public feed for new or logged-out users
              initialQuery = query(
                collection(firestore, 'posts'),
                orderBy('createdAt', 'desc'),
                limit(POST_BATCH_SIZE)
              );
            } else {
              // Personalized feed for logged-in users
              const idsForQuery = [...currentUserProfile.followingIds, user.uid].slice(0, 30);
              initialQuery = query(
                collection(firestore, 'posts'), 
                where('userId', 'in', idsForQuery),
                orderBy('createdAt', 'desc'),
                limit(POST_BATCH_SIZE)
              );
            }

            const documentSnapshots = await getDocs(initialQuery);
            const initialPosts = documentSnapshots.docs.map(doc => doc.data() as Post);
            setPosts(initialPosts);
            setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
            setIsLoadingInitial(false);
            if (documentSnapshots.docs.length < POST_BATCH_SIZE) {
                setHasMore(false);
            }
        }
        fetchInitialPosts();

    }, [firestore, user, currentUserProfile, profileLoading]);

    const fetchMorePosts = async () => {
        if (!firestore || !lastVisible || isLoadingMore) return;
        setIsLoadingMore(true);

        let nextQuery;
        if (!user || !currentUserProfile?.followingIds || currentUserProfile.followingIds.length === 0) {
            nextQuery = query(
                collection(firestore, "posts"),
                orderBy("createdAt", "desc"),
                startAfter(lastVisible),
                limit(POST_BATCH_SIZE)
            );
        } else {
             const idsForQuery = [...currentUserProfile.followingIds, user.uid].slice(0, 30);
             nextQuery = query(
                collection(firestore, "posts"),
                where('userId', 'in', idsForQuery),
                orderBy("createdAt", "desc"),
                startAfter(lastVisible),
                limit(POST_BATCH_SIZE)
            );
        }
        
        const documentSnapshots = await getDocs(nextQuery);
        const newPosts = documentSnapshots.docs.map(doc => doc.data() as Post);

        setPosts(prevPosts => [...prevPosts, ...newPosts]);
        setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1]);
        setIsLoadingMore(false);

        if (documentSnapshots.docs.length < POST_BATCH_SIZE) {
            setHasMore(false);
        }
    }
    
    if (isUserLoading || profileLoading) {
      return <PageSkeleton />;
    }

    const noPostsToShow = posts.length === 0 && !isLoadingInitial;
    const isNewUser = !currentUserProfile?.followingIds || currentUserProfile.followingIds.length === 0;

    return (
       <div className="flex h-screen w-full bg-background">
        {user && <SocialSidebar />}
        
        <div className="flex flex-col flex-1 h-screen">
          {showCreatePost && <CreatePostForm onClose={() => setShowCreatePost(false)} />}
          
          <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex-1 max-w-md">
                <GlobalSearch />
            </div>

            <div className="flex items-center gap-2">
                {user && <Button onClick={() => setShowCreatePost(true)} size="sm" className="hidden md:flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Créer
                </Button>}
                {user && <NotificationsDropdown />}
            </div>
          </header>
          
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pb-16 md:pb-0">
               <div className="container mx-auto max-w-6xl p-0 md:p-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] lg:gap-10">
                   {/* Main Feed */}
                   <div className="space-y-4">
                      {user && <div className="lg:hidden">
                          <SuggestedUsersCarousel />
                      </div>}
                       {isLoadingInitial ? (
                          Array.from({length: 3}).map((_, i) => <CardSkeleton key={i}/>)
                       ) : noPostsToShow ? (
                         <div className="text-center p-10 text-muted-foreground bg-card md:border rounded-lg mt-4">
                              <p className="text-lg font-semibold">{isNewUser ? "Bienvenue sur STUD'IN !" : "Votre fil est vide"}</p>
                              <p className="text-sm">{isNewUser ? "Suivez des personnes pour voir leurs publications ici." : "Les publications de vos amis apparaîtront ici."}</p>
                          </div>
                       ) : (
                          <>
                            {posts.map(post => (
                                <PostCard 
                                    key={post.id} 
                                    post={post}
                                    isInitiallySaved={savedPostMap.has(post.id)}
                                />
                            ))}
                            {hasMore && (
                                <div className="text-center">
                                    <Button variant="outline" onClick={fetchMorePosts} disabled={isLoadingMore}>
                                        {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        Charger plus
                                    </Button>
                                </div>
                            )}
                          </>
                      )}
                  </div>

                  {/* Right Sidebar */}
                  {user && <aside className="hidden lg:block">
                       <SocialFeedSuggestions />
                  </aside>}
             </div>
            </div>
          </div>
        </div>
      </div>
    );
}
