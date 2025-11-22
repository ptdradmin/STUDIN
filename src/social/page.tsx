
'use client';

import { useState } from 'react';
import PostCard from "@/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, orderBy, query } from 'firebase/firestore';
import type { Post } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import CreatePostForm from '@/components/create-post-form';
import { PageSkeleton } from '@/components/page-skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const reelsUsers = [
  { name: "Alice", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=alice" },
  { name: "Bob", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=bob" },
  { name: "Charlie", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=charlie" },
  { name: "Diana", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=diana" },
  { name: "Eva", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=eva" },
  { name: "Frank", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=frank" },
  { name: "Grace", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=grace" },
  { name: "Heidi", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=heidi" },
  { name: "Ivan", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=ivan" },
];

function ReelsTray() {
  return (
    <div className="w-full py-4">
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

export default function SocialPageContent() {
    const firestore = useFirestore();
    
    const postsQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')), [firestore]);
    const { data: posts, isLoading } = useCollection<Post>(postsQuery);
    
    const [showCreateForm, setShowCreateForm] = useState(false);

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="flex flex-col min-h-screen">
             <main className="flex-grow container mx-auto px-0 md:px-4 pt-4">
                {showCreateForm && <CreatePostForm onClose={() => setShowCreateForm(false)} />}
                <div className="max-w-xl mx-auto">
                   {isLoading ? <PageSkeleton /> : (
                     <div className="flex flex-col items-center">
                        <ReelsTray />
                        <div className="space-y-4 pt-4 w-full">
                            <div className="text-right px-4 md:px-0 hidden">
                                <Button onClick={() => setShowCreateForm(true)}>
                                    <Plus className="mr-2 h-4 w-4" /> Créer une publication
                                </Button>
                            </div>
                            {posts && posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                     </div>
                   )}
                </div>
            </main>
        </div>
    );
}
