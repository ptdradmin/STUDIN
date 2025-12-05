
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useUser, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Article } from '@/lib/types';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import SocialSidebar from '@/components/social-sidebar';
import Navbar from '@/components/navbar';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/avatars';
import { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';


function ArticlePageSkeleton() {
    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="aspect-video w-full rounded-lg mb-6" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
            <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <br />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        </div>
    );
}


export default function ArticleDetailPage() {
    const params = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();
    const articleId = params.id as string;

    const articleRef = useMemo(() => {
        if (!firestore || !articleId) return null;
        return doc(firestore, 'articles', articleId);
    }, [firestore, articleId]);

    const { data: article, isLoading } = useDoc<Article>(articleRef);
    
    return (
        <div className="flex min-h-screen w-full bg-background">
            {user && <SocialSidebar />}
            <div className="flex flex-col flex-1">
                {user ? (
                    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <Button variant="ghost" onClick={() => router.push('/news')} className="flex items-center gap-2">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="hidden sm:inline">Retour aux articles</span>
                        </Button>
                    </header>
                ) : (
                    <Navbar />
                )}

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {isLoading ? <ArticlePageSkeleton /> : article ? (
                        <div className="max-w-3xl mx-auto">
                            <div className="relative aspect-video w-full mb-6 rounded-lg overflow-hidden">
                                <Image src={article.imageUrl} alt={article.title} fill className="object-cover" />
                            </div>
                            <Badge variant="secondary" className="mb-2">{article.category}</Badge>
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{article.title}</h1>
                            
                            <div className="flex items-center gap-4 my-6 border-y py-4">
                                <Link href={`/profile/${article.creatorId}`}>
                                    <Avatar>
                                        <AvatarImage src={article.creatorAvatarUrl} />
                                        <AvatarFallback>{getInitials(article.creatorUsername)}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <p className="font-semibold text-sm">{article.creatorUsername}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        <span>Publié le {format(article.createdAt.toDate(), 'd MMMM yyyy', { locale: fr })}</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <ReactMarkdown>{article.content}</ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                         <div className="text-center py-20">
                            <h2 className="text-2xl font-bold">Article non trouvé</h2>
                            <p className="text-muted-foreground mt-2">Cet article n'existe pas ou a été supprimé.</p>
                            <Button onClick={() => router.push('/news')} className="mt-6">Retour aux articles</Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
