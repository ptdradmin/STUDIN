'use client';

import { memo, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ProfileGrid from '@/components/profile-grid';
import type { Post, Favorite, Housing, Event, Tutor, Book } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Bed, CalendarClock, BookOpen, Package } from 'lucide-react';

interface MySavedItemsProps {
    user: import('firebase/auth').User;
    isActive: boolean;
}

const MySavedItems = memo(({ user, isActive }: MySavedItemsProps) => {
    const firestore = useFirestore();

    // Load favorites list (lightweight)
    const userFavoritesQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, `users/${user.uid}/favorites`));
    }, [user, firestore]);

    const { data: favoriteItems, isLoading: favoritesLoading } = useCollection<Favorite>(userFavoritesQuery);

    // Group favorites by type
    const favoritedIds = useMemo(() => {
        const ids: { [key in Favorite['itemType']]?: Set<string> } = {
            housing: new Set(),
            event: new Set(),
            tutor: new Set(),
            post: new Set(),
            book: new Set()
        };
        favoriteItems?.forEach(fav => {
            if (ids[fav.itemType]) {
                ids[fav.itemType]!.add(fav.itemId);
            }
        });
        return ids;
    }, [favoriteItems]);

    // Only load actual items when tab is active
    const savedPostsQuery = useMemoFirebase(() => {
        if (!isActive || !firestore || !favoritedIds.post || favoritedIds.post.size === 0) return null;
        return query(collection(firestore, 'posts'), where(documentId(), 'in', Array.from(favoritedIds.post).slice(0, 30)));
    }, [firestore, favoritedIds.post, isActive]);

    const savedHousingsQuery = useMemoFirebase(() => {
        if (!isActive || !firestore || !favoritedIds.housing || favoritedIds.housing.size === 0) return null;
        return query(collection(firestore, 'housings'), where(documentId(), 'in', Array.from(favoritedIds.housing).slice(0, 30)));
    }, [firestore, favoritedIds.housing, isActive]);

    const savedEventsQuery = useMemoFirebase(() => {
        if (!isActive || !firestore || !favoritedIds.event || favoritedIds.event.size === 0) return null;
        return query(collection(firestore, 'events'), where(documentId(), 'in', Array.from(favoritedIds.event).slice(0, 30)));
    }, [firestore, favoritedIds.event, isActive]);

    const savedTutorsQuery = useMemoFirebase(() => {
        if (!isActive || !firestore || !favoritedIds.tutor || favoritedIds.tutor.size === 0) return null;
        return query(collection(firestore, 'tutorings'), where(documentId(), 'in', Array.from(favoritedIds.tutor).slice(0, 30)));
    }, [firestore, favoritedIds.tutor, isActive]);

    const savedBooksQuery = useMemoFirebase(() => {
        if (!isActive || !firestore || !favoritedIds.book || favoritedIds.book.size === 0) return null;
        return query(collection(firestore, 'books'), where(documentId(), 'in', Array.from(favoritedIds.book).slice(0, 30)));
    }, [firestore, favoritedIds.book, isActive]);

    const { data: savedPosts, isLoading: l1 } = useCollection<Post>(savedPostsQuery);
    const { data: savedHousings, isLoading: l2 } = useCollection<Housing>(savedHousingsQuery);
    const { data: savedEvents, isLoading: l3 } = useCollection<Event>(savedEventsQuery);
    const { data: savedTutors, isLoading: l4 } = useCollection<Tutor>(savedTutorsQuery);
    const { data: savedBooks, isLoading: l5 } = useCollection<Book>(savedBooksQuery);

    const savedItemsLoading = l1 || l2 || l3 || l4 || l5;
    const totalSavedItems = (favoritedIds.post?.size || 0) + (favoritedIds.housing?.size || 0) +
        (favoritedIds.event?.size || 0) + (favoritedIds.tutor?.size || 0) +
        (favoritedIds.book?.size || 0);

    if (!isActive) {
        return null;
    }

    if (favoritesLoading) {
        return (
            <div className="p-4">
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    if (totalSavedItems === 0) {
        return (
            <div className="text-center p-10">
                <p className="text-muted-foreground">Aucun élément sauvegardé.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {savedPosts && savedPosts.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold mb-2">Publications ({savedPosts.length})</h3>
                    <ProfileGrid posts={savedPosts} isLoading={savedItemsLoading} />
                </div>
            )}

            {savedHousings && savedHousings.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold mb-2">Logements ({savedHousings.length})</h3>
                    <div className="space-y-2">
                        {savedHousings.map(h => (
                            <Link href={`/housing/${h.id}`} key={h.id}>
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Bed className="h-5 w-5 text-secondary-foreground" />
                                        <div>
                                            <p className="font-semibold">{h.title}</p>
                                            <p className="text-sm text-muted-foreground">{h.city}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {savedEvents && savedEvents.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold mb-2">Événements ({savedEvents.length})</h3>
                    <div className="space-y-2">
                        {savedEvents.map(e => (
                            <Link href={`/events#event-${e.id}`} key={e.id}>
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <CalendarClock className="h-5 w-5 text-secondary-foreground" />
                                        <div>
                                            <p className="font-semibold">{e.title}</p>
                                            <p className="text-sm text-muted-foreground">{e.city || 'Lieu non spécifié'}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {savedTutors && savedTutors.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold mb-2">Tutorats ({savedTutors.length})</h3>
                    <div className="space-y-2">
                        {savedTutors.map(t => (
                            <Link href={`/tutoring/${t.id}`} key={t.id}>
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <BookOpen className="h-5 w-5 text-secondary-foreground" />
                                        <div>
                                            <p className="font-semibold">{t.subject}</p>
                                            <p className="text-sm text-muted-foreground">{t.level}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {savedBooks && savedBooks.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold mb-2">Livres ({savedBooks.length})</h3>
                    <div className="space-y-2">
                        {savedBooks.map(b => (
                            <Link href={`/books`} key={b.id}>
                                <Card className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <Package className="h-5 w-5 text-secondary-foreground" />
                                        <div>
                                            <p className="font-semibold">{b.title}</p>
                                            <p className="text-sm text-muted-foreground">{b.author}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

MySavedItems.displayName = 'MySavedItems';

export default MySavedItems;
