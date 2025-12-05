
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, getDocs, limit, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Article } from '@/lib/types';
import SocialSidebar from '@/components/social-sidebar';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { Button } from '@/components/ui/button';
import { Loader2, Newspaper } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/navbar';

function ArticleCard({ article }: { article: Article }) {
    return (
        <Link href={`/news/${article.id}`} className="block group">
            <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-xl">
                <div className="relative aspect-video w-full">
                    <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={article.imageHint}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
                <CardContent className="p-4 flex flex-col flex-grow">
                    <Badge variant="outline" className="w-fit">{article.category}</Badge>
                    <h3 className="text-lg font-bold mt-2 flex-grow group-hover:text-primary transition-colors">{article.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{article.summary}</p>
                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex justify-between items-center">
                        <span>Par {article.creatorUsername}</span>
                        <span>{format(article.createdAt.toDate(), 'd MMMM yyyy', { locale: fr })}</span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

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
    
    const [articles, setArticles] = useState<Article[]>([]);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const articlesQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'articles'),
            where('isPublished', '==', true),
            orderBy('createdAt', 'desc')
        );
    }, [firestore]);

    const fetchArticles = useCallback(async (q: any, reset = false) => {
        if (!q) return;
        if (reset) {
            setIsLoading(true);
            setArticles([]);
            setLastVisible(null);
            setHasMore(true);
        } else {
            setIsLoadingMore(true);
        }

        let finalQuery = q;
        if (!reset && lastVisible) {
            finalQuery = query(q, startAfter(lastVisible), limit(6));
        } else {
            finalQuery = query(q, limit(6));
        }

        try {
            const documentSnapshots = await getDocs(finalQuery);
            const newArticles = documentSnapshots.docs.map(doc => doc.data() as Article);
            const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

            setArticles(prev => reset ? newArticles : [...prev, ...newArticles]);
            setLastVisible(lastDoc || null);
            if (documentSnapshots.docs.length < 6) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [lastVisible]);

    useEffect(() => {
        if (articlesQuery) {
            fetchArticles(articlesQuery, true);
        }
    }, [articlesQuery, fetchArticles]);

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
                        ) : articles.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {articles.map(article => (
                                        <ArticleCard key={article.id} article={article} />
                                    ))}
                                </div>
                                {!isLoading && hasMore && (
                                    <div className="text-center mt-8">
                                        <Button onClick={() => fetchArticles(articlesQuery)} disabled={isLoadingMore}>
                                            {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                            Charger plus
                                        </Button>
                                    </div>
                                )}
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
