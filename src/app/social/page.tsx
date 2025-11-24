
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
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SocialLayout from '@/social/layout';
import { Skeleton } from '@/components/ui/skeleton';

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
        // Basic suggestion: get some users, excluding the current one.
        // A real app would have a more complex suggestion algorithm.
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
    
    // Filter out the current user from suggestions
    const filteredSuggestions = suggestedUsers?.filter(u => u.id !== user?.uid).slice(0, 5);

    if (isLoading) {
        return <SuggestionsSkeleton />;
    }

    if (!filteredSuggestions || filteredSuggestions.length === 0) {
        return null; // Don't render the card if there are no suggestions
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

    // Redirect to login if auth check is complete and there's no user
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

    // Show skeleton while auth is loading or if user is not yet determined
    if (isUserLoading || !user) {
        return <PageSkeleton />;
    }

    return (
       <SocialLayout>
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
       </SocialLayout>
    );
}
