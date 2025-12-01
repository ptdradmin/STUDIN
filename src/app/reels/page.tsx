
'use client';

import SocialSidebar from "@/components/social-sidebar";
import ReelCard from "@/components/reel-card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Reel } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Film } from "lucide-react";

export default function ReelsPage() {
    const firestore = useFirestore();

    const reelsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'reels'), orderBy('createdAt', 'desc'), limit(20));
    }, [firestore]);

    const { data: reels, isLoading } = useCollection<Reel>(reelsQuery);

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
                    {!isLoading && reels && reels.length > 0 ? (
                        reels.map((reel, index) => (
                           <div key={reel.id} className="h-full w-full flex justify-center items-center snap-start py-4">
                                <ReelCard reel={reel} />
                           </div>
                        ))
                    ) : !isLoading && (
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
