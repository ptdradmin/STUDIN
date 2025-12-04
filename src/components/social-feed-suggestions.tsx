
'use client';

import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { doc } from 'firebase/firestore';
import UserCard from './user-card';


function SuggestionsSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function SocialFeedSuggestions() {
    const firestore = useFirestore();
    const { user } = useUser();

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: currentUserProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const [suggestions, setSuggestions] = useState<UserProfile[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!firestore || !currentUserProfile) return;
            setIsLoadingSuggestions(true);
            try {
                const usersRef = collection(firestore, 'users');
                // Simple suggestion: get users who are not the current user and not already being followed.
                // A real implementation would be more complex.
                const q = query(usersRef, limit(5));
                const querySnapshot = await getDocs(q);
                let users = querySnapshot.docs
                    .map(doc => doc.data() as UserProfile)
                    .filter(u => u.id !== user?.uid && !currentUserProfile?.followingIds?.includes(u.id));

                setSuggestions(users.slice(0, 5)); // Take first 5 valid suggestions
            } catch (error) {
                console.error("Error fetching user suggestions:", error);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        if(currentUserProfile) {
            fetchSuggestions();
        } else if (!isProfileLoading) {
             setIsLoadingSuggestions(false);
        }

    }, [firestore, user, currentUserProfile, isProfileLoading]);


    const isLoading = isProfileLoading || isLoadingSuggestions;

    if (isLoading) {
        return (
            <div className="sticky top-24 space-y-6">
                <SuggestionsSkeleton />
            </div>
        )
    }

    if (!currentUserProfile) return null;

    return (
        <div className="sticky top-24 space-y-6">
            <UserCard userProfile={currentUserProfile} />

            {suggestions.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">Suggestions pour vous</h3>
                    <div className="space-y-4">
                        {suggestions.map(profile => (
                             <UserCard key={profile.id} userProfile={profile} isSuggestion />
                        ))}
                    </div>
                </div>
            )}
            
            <footer className="text-xs text-muted-foreground space-x-2">
                <Link href="/about" className="hover:underline">À propos</Link><span>&middot;</span>
                <Link href="/help" className="hover:underline">Aide</Link><span>&middot;</span>
                <Link href="/terms" className="hover:underline">Conditions</Link><span>&middot;</span>
                <Link href="/privacy" className="hover:underline">Confidentialité</Link>
                <p className="mt-2">&copy; {new Date().getFullYear()} STUD'IN</p>
            </footer>
        </div>
    )
}
