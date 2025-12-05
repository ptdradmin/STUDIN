
'use client';

import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import type { Post, Favorite, UserProfile } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from '@/firebase';
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
import { doc } from 'firebase/firestore';

export default function SocialPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const firestore = useFirestore();
    const [showCreatePost, setShowCreatePost] = useState(false);

    const userProfileRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: currentUserProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    const postsQuery = useMemoFirebase(() => {
        // MODIFICATION : Ne pas exécuter la requête si l'utilisateur ne suit personne.
        // La requête 'in' avec un tableau vide est invalide et cause une erreur de permission.
        if (!firestore || !currentUserProfile?.followingIds || currentUserProfile.followingIds.length === 0) {
            return null;
        }
        
        // Firestore limite les requêtes 'in' à 30 éléments.
        const followedIds = [...currentUserProfile.followingIds, user?.uid].slice(0, 30);
        
        return query(
          collection(firestore, 'posts'), 
          where('userId', 'in', followedIds),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      }, [firestore, currentUserProfile, user?.uid]);

    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);
    
    const userFavoritesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, `users/${user.uid}/favorites`), where('itemType', '==', 'post'));
    }, [firestore, user]);


    const { data: favoriteItems, isLoading: favoritesLoading } = useCollection<Favorite>(userFavoritesQuery);
    
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
    
    if (isUserLoading || !user || profileLoading) {
      return <PageSkeleton />;
    }

    const isLoading = postsLoading || favoritesLoading;

    return (
       <div className="flex h-screen w-full bg-background">
        <SocialSidebar />
        
        <div className="flex flex-col flex-1 h-screen">
          {showCreatePost && <CreatePostForm onClose={() => setShowCreatePost(false)} />}
          
          <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex-1 max-w-md">
                <GlobalSearch />
            </div>

            <div className="flex items-center gap-2">
                <Button onClick={() => setShowCreatePost(true)} size="sm" className="hidden md:flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Créer
                </Button>
                 <NotificationsDropdown />
            </div>
          </header>
          
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pb-16 md:pb-0">
               <div className="container mx-auto max-w-6xl p-0 md:p-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] lg:gap-10">
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
                              />
                          ))
                       ) : (
                         <div className="text-center p-10 text-muted-foreground bg-card md:border rounded-lg mt-4">
                              <p className="text-lg font-semibold">Votre fil est vide</p>
                              <p className="text-sm">Suivez des personnes pour voir leurs publications ici, ou publiez votre première photo !</p>
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
