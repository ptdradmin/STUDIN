
'use client';

import SocialSidebar from "@/components/social-sidebar";
import ReelCard from "@/components/reel-card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Reel } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Film } from "lucide-react";
import { Timestamp } from "firebase/firestore";

// Données de substitution pour la démonstration
const placeholderReels: Reel[] = [
  {
    id: '1',
    videoUrl: 'https://picsum.photos/seed/reel1/400/700',
    caption: 'Première journée sur le campus! 🎓 #unilife',
    userId: 'user1',
    username: 'Alice',
    userAvatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=alice',
    likes: ['user2', 'user3'],
    comments: [
      { userId: 'user2', username: 'Bob', text: 'Superbe!', createdAt: new Date().toISOString(), userAvatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=bob' },
    ],
    createdAt: Timestamp.fromDate(new Date()),
  },
  {
    id: '2',
    videoUrl: 'https://picsum.photos/seed/reel2/400/700',
    caption: 'Petite session d\'étude à la bibliothèque 📚',
    userId: 'user2',
    username: 'Bob',
    userAvatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=bob',
    likes: ['user1', 'user4', 'user5'],
    comments: [],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 3600 * 1000)),
  },
    {
    id: '3',
    videoUrl: 'https://picsum.photos/seed/reel3/400/700',
    caption: 'Soirée étudiante 🔥',
    userId: 'user3',
    username: 'Charlie',
    userAvatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=charlie',
    likes: ['user1'],
    comments: [],
    createdAt: Timestamp.fromDate(new Date(Date.now() - 86400 * 1000 * 2)),
  },
];


export default function ReelsPage() {
    const firestore = useFirestore();

    const reelsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'reels'), orderBy('createdAt', 'desc'), limit(20));
    }, [firestore]);

    const { data: reels, isLoading } = useCollection<Reel>(reelsQuery);

    const reelsToDisplay = (reels && reels.length > 0) || isLoading ? reels : placeholderReels;

    return (
        <div className="flex h-screen w-full bg-black">
            <SocialSidebar />
            <div className="flex-1 flex justify-center items-center overflow-hidden">
                <div className="h-full w-full max-w-sm flex-shrink-0 snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
                    {isLoading && (
                        <div className="h-full w-full flex items-center justify-center snap-start">
                             <Skeleton className="h-[95%] w-[95%] rounded-2xl" />
                        </div>
                    )}
                    {!isLoading && reelsToDisplay && reelsToDisplay.length > 0 ? (
                        reelsToDisplay.map((reel, index) => (
                           <div key={reel.id} className="h-full w-full flex justify-center items-center snap-start py-4">
                                <ReelCard reel={reel} />
                           </div>
                        ))
                    ) : (
                         <div className="flex flex-col items-center justify-center text-center p-8 h-full text-white">
                            <Film className="h-24 w-24 text-muted-foreground" strokeWidth={1} />
                            <h1 className="text-2xl font-bold mt-4">Aucun Reel pour le moment</h1>
                            <p className="text-muted-foreground mt-2 max-w-sm">
                                Soyez le premier à partager une vidéo !
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
