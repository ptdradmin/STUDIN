
'use client';

import PostCard from "@/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, orderBy, query, limit } from 'firebase/firestore';
import type { Post, UserProfile } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';
import { Skeleton } from "@/components/ui/skeleton";

const UsersTraySkeleton = () => (
  <div className="w-full py-4 overflow-hidden">
      <div className="flex space-x-4">
        {Array.from({length: 7}).map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-1 flex-shrink-0">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-3 w-12 rounded-sm" />
          </div>
        ))}
      </div>
  </div>
);


const UsersTray = ({ users }: { users: UserProfile[] }) => {
  if (!users || users.length === 0) {
    return <UsersTraySkeleton />;
  }

  return (
    <div className="w-full py-4 overflow-hidden border-b border-border">
      <div className="flex space-x-4">
        {users.map((user) => (
          <div key={user.id} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"></div>
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

    const usersQuery = useMemoFirebase(() => !firestore ? null : query(collection(firestore, 'users'), limit(10)), [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);
    
    const isLoading = postsLoading || usersLoading;

    return (
        <div className="flex justify-center py-8">
            <div className="w-full max-w-[630px] md:max-w-[820px] lg:max-w-[630px]">
                <div className="flex flex-col md:flex-row md:gap-8">
                    <div className="w-full md:max-w-[470px] mx-auto">
                        <UsersTray users={users || []} />
                        <div className="w-full">
                            {isLoading && <PageSkeleton />}
                            {!isLoading && posts && posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                            {!isLoading && posts?.length === 0 && (
                                 <div className="text-center py-20">
                                    <h3 className="text-2xl font-semibold">Bienvenue sur Stud'in</h3>
                                    <p className="text-muted-foreground mt-2">Commencez par suivre des gens pour voir leurs publications ici.</p>
                                 </div>
                             )}
                        </div>
                    </div>
                    <aside className="hidden lg:block w-full max-w-xs">
                        {/* Suggestions Sidebar can go here */}
                    </aside>
                </div>
            </div>
        </div>
    );
}
