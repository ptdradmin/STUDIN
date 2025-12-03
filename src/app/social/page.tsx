
'use client';

import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import type { Post, UserProfile, Favorite } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { PageSkeleton, CardSkeleton } from '@/components/page-skeleton';
import PostCard from '@/components/post-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus } from 'lucide-react';
import CreatePostForm from '@/components/create-post-form';
import NotificationsDropdown from '@/components/notifications-dropdown';
import GlobalSearch from '@/components/global-search';
import SocialSidebar from '@/components/social-sidebar';

function SuggestionsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-grow space-y-1">
                            <Skeleton className="h-4 w-2/3" />
                             <Skeleton className="h-3 w-1/3" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function Suggestions() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!firestore || !user) return;
            setIsLoading(true);

            try {
                const userDocRef = doc(firestore, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                const followingIds = userDocSnap.data()?.followingIds || [];
                
                const usersToExclude = [user.uid, ...followingIds];

                const suggestionsQuery = query(
                    collection(firestore, 'users'),
                    limit(15) // Fetch a bit more to have a chance to filter
                );
                
                const querySnapshot = await getDocs(suggestionsQuery);
                const users = querySnapshot.docs
                    .map(doc => doc.data() as UserProfile)
                    .filter(u => !usersToExclude.includes(u.id))
                    .slice(0, 5);
                
                setSuggestedUsers(users);
            } catch (error) {
                 if (error instanceof FirestorePermissionError === false) {
                    const contextualError = new FirestorePermissionError({
                        path: `users`,
                        operation: 'list',
                    });
                    errorEmitter.emit('permission-error', contextualError);
                 }
                 console.error("Error fetching suggestions:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSuggestions();
    }, [firestore, user]);

     const getInitials = (name?: string) => {
        if (!name) return "..";
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }

    if (isLoading) {
        return <SuggestionsSkeleton />;
    }

    if (suggestedUsers.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Suggestions pour vous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {suggestedUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={u.profilePicture} />
                            <AvatarFallback>{getInitials(u.firstName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow overflow-hidden">
                            <Link href={`/profile/${u.id}`} className="font-semibold text-sm hover:underline truncate block">{u.username}</Link>
                            <p className="text-xs text-muted-foreground truncate">Suggéré pour vous</p>
                        </div>
                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                            <Link href={`/profile/${u.id}`}>Suivre</Link>
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

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
    
    if (!user && !isUserLoading) {
        router.push('/login?from=/social');
        return <PageSkeleton />;
    }
    
    if (isUserLoading) {
      return <PageSkeleton />;
    }

    const isLoading = postsLoading || favoritesLoading;

    return (
       <div className="flex min-h-screen w-full bg-background">
        <SocialSidebar />
        
        <div className="flex flex-col flex-1">
          {showCreatePost && <CreatePostForm onClose={() => setShowCreatePost(false)} />}
          
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
             <div className="w-full">
                <div className="container mx-auto py-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8">
                        <div className="w-full max-w-[470px] mx-auto space-y-4">
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
                               <div className="text-center p-10 text-muted-foreground bg-card md:border rounded-lg">
                                    <p className="text-lg font-semibold">Votre fil est vide</p>
                                    <p className="text-sm">Suivez des personnes pour voir leurs publications ici.</p>
                                </div>
                            )}
                        </div>
                        <div className="hidden md:block space-y-6">
                            <Suggestions />
                        </div>
                    </div>
                </div>
           </div>
          </main>
        </div>
      </div>
    );
}
