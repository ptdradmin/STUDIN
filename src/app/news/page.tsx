
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useFirestore, useUser, useCollection } from '@/firebase';
import type { Article } from '@/lib/types';
import SocialSidebar from '@/components/social-sidebar';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/navbar';
import ArticleCard from '@/components/article-card';

function ArticleListSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-video w-full" />
                    <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export default function NewsPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    
    const articlesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'articles'),
            where('isPublished', '==', true),
            orderBy('createdAt', 'desc')
        );
    }, [firestore]);

    const { data: articles, isLoading, error } = useCollection<Article>(articlesQuery);
    
    // Note: Pagination logic is removed for simplicity with useCollection.
    // For infinite scroll, a more advanced hook would be needed.

    if (error) {
        // The error is now thrown by the useCollection hook via the listener,
        // so we can just display a simple message here.
        return (
             <div className="flex min-h-screen w-full bg-background">
                {user && <SocialSidebar />}
                <div className="flex flex-col flex-1 items-center justify-center p-4">
                     <Card className="text-center py-20 col-span-full">
                        <CardContent>
                            <Newspaper className="h-16 w-16 mx-auto text-destructive mb-4" strokeWidth={1}/>
                            <h3 className="text-xl font-semibold">Erreur de chargement</h3>
                            <p className="text-muted-foreground mt-2">Impossible de charger les articles pour le moment.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full bg-background">
            {user && <SocialSidebar />}
            <div className="flex flex-col flex-1">
                {user ? (
                    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex-1 max-w-md">
                            <GlobalSearch />
                        </div>
                        <div className="flex items-center gap-2">
                            <NotificationsDropdown />
                        </div>
                    </header>
                ) : (
                    <Navbar />
                )}

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="container mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold tracking-tight">Infos Étudiantes</h1>
                            <p className="text-muted-foreground mt-1">Actualités, conseils et informations officielles pour votre vie étudiante.</p>
                        </div>
                        
                        {isLoading ? (
                            <ArticleListSkeleton />
                        ) : articles && articles.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {articles.map(article => (
                                        <ArticleCard key={article.id} article={article} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Card className="text-center py-20">
                                <CardContent>
                                    <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" strokeWidth={1}/>
                                    <h3 className="text-xl font-semibold">Aucun article pour le moment</h3>
                                    <p className="text-muted-foreground mt-2">Revenez bientôt pour les dernières actualités !</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
