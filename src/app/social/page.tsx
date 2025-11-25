
'use client';

import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Post, UserProfile } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { PageSkeleton, CardSkeleton } from '@/components/page-skeleton';
import PostCard from '@/components/post-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, Plus, Search } from 'lucide-react';
import CreatePostForm from '@/components/create-post-form';
import NotificationsDropdown from '@/components/notifications-dropdown';
import UserSearch from '@/components/user-search';
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

    const suggestionsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'users'),
            limit(10)
        );
    }, [firestore, user]);

    const { data: suggestedUsers, isLoading } = useCollection<UserProfile>(suggestionsQuery);

     const getInitials = (name?: string) => {
        if (!name) return "..";
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }
    
    const filteredSuggestions = suggestedUsers?.filter(u => u.id !== user?.uid).slice(0, 5);

    if (isLoading) {
        return <SuggestionsSkeleton />;
    }

    if (!filteredSuggestions || filteredSuggestions.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Suggestions pour vous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {filteredSuggestions.map(u => (
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

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login?from=/social');
        }
    }, [user, isUserLoading, router]);

    const postsQuery = useMemoFirebase(
        () => !firestore ? null : query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')),
        [firestore]
    );

    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);
    
    const getInitials = (email?: string | null) => {
        if (!email) return '..';
        const nameParts = user?.displayName?.split(' ');
        if(nameParts && nameParts.length > 1 && nameParts[0] && nameParts[1]) {
            return nameParts[0][0] + nameParts[1][0];
        }
        return email.substring(0, 2).toUpperCase();
    }
    
    // We rely on the root layout to handle the main loading state
    if (!user) {
        return <PageSkeleton />;
    }

    return (
       <div className="flex min-h-screen w-full bg-background">
        <SocialSidebar />
        
        <div className="flex flex-col flex-1">
          {showCreatePost && <CreatePostForm onClose={() => setShowCreatePost(false)} />}
          
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between md:justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex-1 md:hidden">
                 <Link href="/social" className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <h1 className="text-lg font-bold">STUD'IN</h1>
                  </Link>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-md items-center">
                <UserSearch />
            </div>

            <div className="flex items-center gap-2">
                <div className="md:hidden">
                    <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
                </div>
                <Button onClick={() => setShowCreatePost(true)} size="sm" className="hidden md:flex items-center gap-2" disabled={isUserLoading || !user}>
                    <Plus className="h-4 w-4" />
                    Créer
                </Button>
                 <NotificationsDropdown />
                <Link href="/profile" className="md:hidden">
                   <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src={user?.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user?.email}`} />
                      <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                    </Avatar>
                </Link>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
             <div className="w-full">
                <div className="container mx-auto max-w-4xl px-0 md:px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,290px] gap-8 items-start">
                        <div className="space-y-4 w-full max-w-[470px] mx-auto">
                             {postsLoading ? (
                                Array.from({length: 3}).map((_, i) => <CardSkeleton key={i}/>)
                             ) : posts && posts.length > 0 ? (
                                posts.map(post => <PostCard key={post.id} post={post} />)
                            ) : (
                                <div className="text-center p-10 text-muted-foreground bg-card md:border rounded-lg">
                                    <p className="text-lg font-semibold">Le fil d'actualité est vide.</p>
                                    <p className="text-sm">Soyez le premier à poster quelque chose !</p>
                                </div>
                            )}
                        </div>
                        <div className="hidden md:block">
                             <div className="sticky top-20">
                                <Suggestions />
                             </div>
                        </div>
                    </div>
                </div>
           </div>
          </main>
        </div>
      </div>
    );
}
