
'use client';

import { useState } from 'react';
import PostCard from "@/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, orderBy, query } from 'firebase/firestore';
import type { Post, UserProfile } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import CreatePostForm from '@/components/create-post-form';
import { PageSkeleton } from '@/components/page-skeleton';

const UsersTray = ({ users }: { users: UserProfile[] }) => {
  if (!users || users.length === 0) {
    return (
       <div className="w-full py-4">
        <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
            <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground">
                    <AvatarFallback>?</AvatarFallback>
                </Avatar>
                </div>
                <span className="text-xs w-16 text-center text-muted-foreground">Aucun utilisateur</span>
            </div>
        </div>
       </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
        {users.map((user) => (
          <div key={user.id} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 group-hover:animate-pulse"></div>
              <Avatar className="h-16 w-16 border-2 border-background relative">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback>{user.firstName ? user.firstName.substring(0, 2).toUpperCase() : '??'}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs truncate w-16 text-center">{user.firstName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SocialPageContent() {
    const firestore = useFirestore();
    
    const postsQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')), [firestore]);
    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);

    const usersQuery = useMemoFirebase(() => !firestore ? null : collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);
    
    const [showCreateForm, setShowCreateForm] = useState(false);

    const isLoading = postsLoading || usersLoading;

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
                        <UsersTray users={users || []} />
                        <div className="space-y-4 pt-4 w-full">
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
