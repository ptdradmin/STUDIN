
'use client';

import { collection, query, orderBy } from 'firebase/firestore';
import type { Post } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { PageSkeleton } from '@/components/page-skeleton';
import PostCard from '@/components/post-card';
import { Separator } from '@/components/ui/separator';

export default function SocialPageContent() {
    const firestore = useFirestore();

    const postsQuery = useMemoFirebase(
        () => !firestore ? null : query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')),
        [firestore]
    );

    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);

    if (postsLoading && !posts) {
        return <PageSkeleton />;
    }

    return (
       <div className="flex justify-center w-full">
            <div className="w-full max-w-xl">
                 <div className="p-4 border-b">
                    <h1 className="text-xl font-bold">Fil d'actualité</h1>
                </div>
                {posts && posts.length > 0 ? (
                    posts.map(post => <PostCard key={post.id} post={post} />)
                ) : (
                    <div className="text-center p-10 text-muted-foreground">
                        <p>Le fil d'actualité est vide.</p>
                        <p className="text-sm">Soyez le premier à poster quelque chose !</p>
                    </div>
                )}
            </div>
            <div className="hidden lg:block w-96 pl-8">
                 <div className="sticky top-20">
                     <h3 className="font-bold">Suggestions</h3>
                     {/* Suggestion component would go here */}
                 </div>
            </div>
       </div>
    );
}
