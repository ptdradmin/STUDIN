
'use client';

import { collection, query, orderBy, limit, where, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import type { Post, Favorite, UserProfile } from '@/lib/types';
import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { PageSkeleton, CardSkeleton } from '@/components/page-skeleton';
import PostCard from '@/components/post-card';
import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
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
import { useInView } from 'framer-motion';

const POST_BATCH_SIZE = 5;

export default function SocialPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const [showCreatePost, setShowCreatePost] = useState(false);
    
    const [posts, setPosts] = useState<Post[]>([]);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const loadMoreRef = useRef(null);
    const isInView = useInView(loadMoreRef, { once: true, margin: "200px" });


    const userProfileRef = useMemo(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: currentUserProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    const userFavoritesQuery = useMemo(() => {
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

    const fetchPosts = useCallback(async (lastDoc: QueryDocumentSnapshot<DocumentData> | null = null) => {
        if (!firestore || (lastDoc === null && posts.length > 0)) return; // Don't refetch initial if already loaded
        
        setIsLoading(true);

        let postQuery;
        const followingIds = currentUserProfile?.followingIds;
        const hasFollowing = user && followingIds && followingIds.length > 0;

        if (hasFollowing) {
            const idsForQuery = [...followingIds, user.uid].slice(0, 30);
            postQuery = query(
                collection(firestore, 'posts'),
                where('userId', 'in', idsForQuery),
                orderBy('createdAt', 'desc'),
                ...(lastDoc ? [startAfter(lastDoc)] : []),
                limit(POST_BATCH_SIZE)
            );
        } else {
             postQuery = query(
                collection(firestore, 'posts'),
                orderBy('createdAt', 'desc'),
                ...(lastDoc ? [startAfter(lastDoc)] : []),
                limit(POST_BATCH_SIZE)
            );
        }
        
        try {
            const documentSnapshots = await getDocs(postQuery);
            const newPosts = documentSnapshots.docs.map(doc => doc.data() as Post);
            const newLastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];

            setPosts(prev => lastDoc ? [...prev, ...newPosts] : newPosts);
            setLastVisible(newLastVisible || null);
            setHasMore(documentSnapshots.docs.length === POST_BATCH_SIZE);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setIsLoading(false);
        }

    }, [firestore, user, currentUserProfile, posts.length]);
    
    
    useEffect(() => {
        if (user && !profileLoading) {
            fetchPosts();
        }
    }, [user, profileLoading, fetchPosts]);

    useEffect(() => {
        if (isInView && hasMore && !isLoading) {
            fetchPosts(lastVisible);
        }
    }, [isInView, hasMore, isLoading, lastVisible, fetchPosts]);
    
    if (isUserLoading || (isLoading && posts.length === 0)) {
      return <PageSkeleton />;
    }

    if (!user) {
      // This part will be briefly visible while the redirect from useEffect is happening.
      return <PageSkeleton />;
    }

    const noPostsToShow = posts.length === 0 && !isLoading;
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
                       {isLoading && posts.length === 0 ? (
                          Array.from({length: 3}).map((_, i) => <CardSkeleton key={`skeleton-${i}`}/>)
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
                            <div ref={loadMoreRef} className="h-10 text-center">
                                {isLoading && posts.length > 0 && <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />}
                                {!hasMore && posts.length > 0 && <p className="text-sm text-muted-foreground">Vous avez tout vu !</p>}
                            </div>
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
