
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from "@/components/post-card";
import { Camera, Home, Plus, Search } from 'lucide-react';
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Post } from '@/lib/types';
import CreatePostForm from '@/components/create-post-form';
import { collection, orderBy, query } from 'firebase/firestore';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageSkeleton } from '@/components/page-skeleton';

const reelsUsers = [
  { name: "Alice", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=alice" },
  { name: "Bob", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=bob" },
  { name: "Charlie", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=charlie" },
  { name: "Diana", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=diana" },
  { name: "Eva", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=eva" },
  { name: "Frank", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=frank" },
  { name: "Grace", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=grace" },
];

function ReelsTray() {
  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-0 py-3 border-b md:border-x md:rounded-t-lg">
      <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
        {reelsUsers.map((user) => (
          <div key={user.name} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 group-hover:animate-pulse"></div>
              <Avatar className="h-16 w-16 border-2 border-background relative">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs truncate w-16 text-center">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


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

export default function SocialPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    
    const postsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
    }, [firestore]);
    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);
    
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login?from=/social');
        }
    }, [user, isUserLoading, router]);
    
    const isLoading = isUserLoading || postsLoading;

    if (isLoading || !user) {
        return <PageSkeleton />;
    }

    return (
         <>
             <div className="container mx-auto px-0 md:px-4 pt-4">
                {showCreateForm && <CreatePostForm onClose={() => setShowCreateForm(false)} />}
                <div className="max-w-xl mx-auto">
                   {postsLoading && <SocialSkeleton />}
                   {!postsLoading && posts && (
                     <>
                        <ReelsTray />
                        <div className="space-y-4 pt-4">
                            {posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                     </>
                   )}
                </div>
            </div>
        </>
    );
}
