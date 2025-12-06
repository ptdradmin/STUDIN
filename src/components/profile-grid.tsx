'use client';

import { memo, useState, useCallback } from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Post } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface ProfileGridProps {
    posts: Post[];
    isLoading?: boolean;
    hasMore?: boolean;
    onLoadMore?: () => void;
    isLoadingMore?: boolean;
}

const ProfileGrid = memo(({ posts, isLoading, hasMore, onLoadMore, isLoadingMore }: ProfileGridProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-3 gap-1 mt-1">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center p-10">
                <h3 className="text-lg font-semibold">Aucune publication</h3>
                <p className="text-muted-foreground text-sm">Les publications apparaîtront ici.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-1">
                {posts.map((post, index) => (
                    <div key={post.id} className="relative aspect-square bg-muted">
                        {post.imageUrl && (
                            <Image
                                src={post.imageUrl}
                                alt="User post"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 33vw, 25vw"
                                loading={index < 6 ? 'eager' : 'lazy'}
                                priority={index < 6}
                            />
                        )}
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center py-4">
                    <Button
                        variant="ghost"
                        onClick={onLoadMore}
                        disabled={isLoadingMore}
                        className="w-full max-w-xs"
                    >
                        {isLoadingMore ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Chargement...
                            </>
                        ) : (
                            'Voir plus de publications'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
});

ProfileGrid.displayName = 'ProfileGrid';

export default ProfileGrid;
