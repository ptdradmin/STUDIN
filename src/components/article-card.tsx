
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Article } from '@/lib/types';

export default function ArticleCard({ article }: { article: Article }) {
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
