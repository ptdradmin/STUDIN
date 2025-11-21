
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import PostCard from "@/components/post-card";
import { getPosts, Post } from "@/lib/mock-data";
import { Camera } from 'lucide-react';
import Link from "next/link";
import { Skeleton } from './ui/skeleton';

function SocialSkeleton() {
    return (
        <div className="max-w-xl mx-auto">
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                     <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

function CardSkeleton() {
    return (
        <div className="rounded-none md:rounded-lg border-x-0 md:border p-3">
             <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="aspect-square w-full" />
            <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
    )
}


export default function SocialClientPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isPostsLoading, setIsPostsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?from=/social');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            getPosts().then(data => {
                setPosts(data);
                setIsPostsLoading(false);
            });
        }
    }, [user]);

    if (loading || !user || isPostsLoading) {
        return (
            <main className="flex-grow container mx-auto px-0 md:px-4 py-4">
                <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-4">
                    <div className="container flex h-16 items-center justify-between">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-6 w-6" />
                    </div>
                </header>
                <SocialSkeleton />
            </main>
        )
    }

    return (
         <>
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                 <div className="container flex h-16 items-center justify-between">
                    <Link href="/social">
                        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                            STUD'IN Social
                        </h1>
                    </Link>
                    <button>
                        <Camera className="h-6 w-6" />
                    </button>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-0 md:px-4 py-4">
                <div className="max-w-xl mx-auto">
                    <div className="space-y-4">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
