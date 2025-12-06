

'use client';

import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

function UserSuggestionCard({ userProfile }: { userProfile: UserProfile }) {
    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length > 1 && parts[0] && parts[1]) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    return (
        <Card className="text-center">
            <CardContent className="p-4 flex flex-col items-center justify-center">
                <Avatar className="h-16 w-16 mb-2">
                    <AvatarImage src={userProfile.profilePicture} alt={userProfile.username} />
                    <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                </Avatar>
                <p className="font-semibold text-sm truncate w-full">{userProfile.username}</p>
                <p className="text-xs text-muted-foreground truncate w-full">{userProfile.university || 'Étudiant'}</p>
                <Button asChild size="sm" className="mt-3 w-full">
                    <Link href={`/profile/${userProfile.id}`}>Voir</Link>
                </Button>
            </CardContent>
        </Card>
    )
}

function UserSuggestionSkeleton() {
    return (
        <Card className="text-center">
            <CardContent className="p-4 flex flex-col items-center justify-center">
                <Skeleton className="h-16 w-16 rounded-full mb-2" />
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-9 w-full mt-3" />
            </CardContent>
        </Card>
    )
}

export default function SuggestedUsersCarousel() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!firestore) return;
            setIsLoading(true);
            try {
                const usersRef = collection(firestore, 'users');
                const q = query(usersRef, limit(10));
                const querySnapshot = await getDocs(q);
                let users = querySnapshot.docs.map(doc => doc.data() as UserProfile);

                if (user) {
                    users = users.filter(u => u.id !== user.uid);
                }

                setSuggestions(users);
            } catch (error) {
                console.error("Error fetching user suggestions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [firestore, user]);

    if (isLoading) {
        return (
             <div className="py-4 border-y">
                <Carousel opts={{ align: "start", loop: false }} className="w-full">
                    <CarouselContent className="-ml-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <CarouselItem key={index} className="pl-2 basis-1/3 md:basis-1/4">
                                <UserSuggestionSkeleton />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        )
    }

    if (suggestions.length === 0) {
        return null; // Don't render anything if there are no suggestions
    }

    return (
        <div className="py-6 border-y">
             <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-4">Suggestions pour vous</h2>
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
                <CarouselContent className="-ml-4 px-4">
                    {suggestions.map((userProfile) => (
                        <CarouselItem key={userProfile.id} className="pl-2 basis-1/3 md:basis-1/4">
                           <UserSuggestionCard userProfile={userProfile} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    )
}
