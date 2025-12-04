

'use client';

import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Post, Favorite } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { PageSkeleton, CardSkeleton } from '@/components/page-skeleton';
import PostCard from '@/components/post-card';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CreatePostForm from '@/components/create-post-form';
import NotificationsDropdown from '@/components/notifications-dropdown';
import GlobalSearch from '@/components/global-search';
import SocialSidebar from '@/components/social-sidebar';
import SuggestedUsersCarousel from '@/components/suggested-users-carousel';
import SocialFeedSuggestions from '@/components/social-feed-suggestions';

export default function SocialPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const [showCreatePost, setShowCreatePost] = useState(false);

    const postsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
          collection(firestore, 'posts'), 
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      }, [firestore]);

    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);
    
    const userFavoritesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, `users/${user.uid}/favorites`));
    }, [firestore, user]);


    const { data: favoriteItems, isLoading: favoritesLoading } = useCollection<Favorite>(userFavoritesQuery);
    
    const savedPostMap = useMemo(() => {
        const map = new Map<string, string>();
        if (favoriteItems) {
            favoriteItems.forEach(fav => {
                if (fav.itemType === 'post') {
                    map.set(fav.itemId, fav.id);
                }
            });
        }
        return map;
    }, [favoriteItems]);

    useEffect(() => {
      if (!isUserLoading && !user) {
        router.push('/login?from=/social');
      }
    }, [isUserLoading, user, router]);
    
    if (isUserLoading || !user) {
      return <PageSkeleton />;
    }

    const isLoading = postsLoading || favoritesLoading;

    return (
       <div className="flex h-screen w-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
        <SocialSidebar />
        
        <div className="flex flex-col flex-1 h-screen">
          {showCreatePost && <CreatePostForm onClose={() => setShowCreatePost(false)} />}
          
          <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex-1 max-w-md">
                <GlobalSearch />
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreatePost(true)} size="sm" className="hidden md:flex items-center gap-2" disabled={isUserLoading || !user}>
                    <Plus className="h-4 w-4" />
                    Créer
                </Button>
                 <NotificationsDropdown />
            </div>
          </header>
          
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pb-16 md:pb-0">
               <div className="container mx-auto max-w-5xl py-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">
                   {/* Main Feed */}
                   <div className="space-y-4">
                      <div className="lg:hidden">
                          <SuggestedUsersCarousel />
                      </div>
                       {isLoading ? (
                          Array.from({length: 3}).map((_, i) => <CardSkeleton key={i}/>)
                       ) : posts && posts.length > 0 ? (
                          posts.map(post => (
                              <PostCard 
                                  key={post.id} 
                                  post={post}
                                  isInitiallySaved={savedPostMap.has(post.id)}
                                  initialFavoriteId={savedPostMap.get(post.id)}
                              />
                          ))
                       ) : (
                         <div className="text-center p-10 text-muted-foreground bg-card md:border rounded-lg mt-4">
                              <p className="text-lg font-semibold">Votre fil est vide</p>
                              <p className="text-sm">Suivez des personnes pour voir leurs publications ici.</p>
                          </div>
                      )}
                  </div>

                   {/* Right Sidebar */}
                   <aside className="hidden lg:block">
                      <SocialFeedSuggestions />
                   </aside>
             </div>
            </div>
          </div>
        </div>
      </div>
    );
}
