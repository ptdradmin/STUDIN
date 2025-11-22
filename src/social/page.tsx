
'use client';

import PostCard from "@/components/post-card";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, orderBy, query } from 'firebase/firestore';
import type { Post, UserProfile } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';

const UsersTray = ({ users }: { users: UserProfile[] }) => {
  if (!users || users.length === 0) {
    return null;
  }

  return (
    <div className="w-full py-4 overflow-hidden">
      <div className="flex space-x-4">
         {/* Fake "Your Story" */}
         <div className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group">
            <div className="relative">
                 <Avatar className="h-16 w-16">
                    <AvatarImage src="https://api.dicebear.com/7.x/micah/svg?seed=placeholder" />
                    <AvatarFallback>??</AvatarFallback>
                </Avatar>
                 <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full h-5 w-5 flex items-center justify-center border-2 border-background">
                    <span className="text-white text-xs">+</span>
                </div>
            </div>
             <span className="text-xs truncate w-16 text-center text-muted-foreground">Votre story</span>
        </div>
        
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

    const usersQuery = useMemoFirebase(() => !firestore ? null : collection(firestore, 'users'), [firestore]);
    const { data: users, isLoading: usersLoading } = useCollection<UserProfile>(usersQuery);
    
    const isLoading = postsLoading || usersLoading;

    if (isLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="flex flex-col min-h-screen">
             <main className="flex-grow flex justify-center py-8">
                <div className="max-w-[630px] w-full">
                   {isLoading ? <PageSkeleton /> : (
                     <div className="flex flex-col items-center w-full">
                        <UsersTray users={users || []} />
                        <div className="space-y-4 pt-4 w-full max-w-[470px]">
                            {posts && posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                             {posts?.length === 0 && (
                                 <div className="text-center py-20">
                                    <h3 className="text-2xl font-semibold">Bienvenue !</h3>
                                    <p className="text-muted-foreground mt-2">Commencez par suivre des gens pour voir leurs publications ici.</p>
                                 </div>
                             )}
                        </div>
                     </div>
                   )}
                </div>
            </main>
        </div>
    );
}
