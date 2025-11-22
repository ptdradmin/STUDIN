'use client';

import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Post, UserProfile } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';
import PostCard from '@/components/post-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function SuggestionsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="h-5 w-3/4 animate-pulse rounded-md bg-muted"></CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-muted"></div>
                        <div className="flex-grow space-y-1">
                            <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted"></div>
                             <div className="h-3 w-1/3 animate-pulse rounded-md bg-muted"></div>
                        </div>
                        <div className="h-8 w-16 animate-pulse rounded-md bg-muted"></div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function Suggestions() {
    const { user } = useUser();
    const firestore = useFirestore();

    // Suggest users who are not the current user and whom the current user is not already following.
    const suggestionsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'users'),
            // This is a simplified suggestion logic. A real-world app would have a more complex algorithm.
            // Here we just grab a few users. We will filter out the current user and followed users on the client.
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
    
    // In a real app, you'd fetch the current user's profile to get their `followingIds` list
    // For now, we'll just filter out the current user.
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


export default function SocialPageContent() {
    const firestore = useFirestore();

    const postsQuery = useMemoFirebase(
        () => !firestore ? null : query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')),
        [firestore]
    );

    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);

    if (postsLoading && !posts) {
        return <PageSkeleton />;
    }

    return (
       <div className="w-full">
            <div className="container mx-auto px-0 sm:px-4 max-w-4xl py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 space-y-4">
                         {posts && posts.length > 0 ? (
                            posts.map(post => <PostCard key={post.id} post={post} />)
                        ) : (
                            <div className="text-center p-10 text-muted-foreground bg-card rounded-lg border-x-0 md:border">
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
    );
}
