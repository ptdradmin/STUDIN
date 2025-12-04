
'use client';

import SocialSidebar from "@/components/social-sidebar";
import ReelCard from "@/components/reel-card";
import { useFirestore, useUser } from "@/firebase";
import { collection, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import type { Reel } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Film, Plus } from "lucide-react";
import CreateReelForm from "@/components/create-reel-form";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ReelsPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    
    const [showCreateReel, setShowCreateReel] = useState(false);
    const [allReels, setAllReels] = useState<Reel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef<IntersectionObserver>();

    const fetchNextReels = useCallback(async () => {
        if (!firestore || !lastVisible) return;
        
        let q = query(
            collection(firestore, 'reels'), 
            orderBy('createdAt', 'desc'), 
            startAfter(lastVisible),
            limit(3)
        );
        
        try {
            const documentSnapshots = await getDocs(q);
            const newReels = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reel));
            
            setAllReels(prevReels => [...prevReels, ...newReels]);
            
            const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            setLastVisible(lastDoc || null);

            if (documentSnapshots.docs.length < 3) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching more reels:", error);
        }
    }, [firestore, lastVisible]);
    
    useEffect(() => {
        const fetchInitialReels = async () => {
             if (!firestore) return;
             setIsLoading(true);
             setHasMore(true);

             const q = query(collection(firestore, 'reels'), orderBy('createdAt', 'desc'), limit(3));
             try {
                const documentSnapshots = await getDocs(q);
                const initialReels = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reel));
                setAllReels(initialReels);
                
                const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
                setLastVisible(lastDoc || null);

                if (documentSnapshots.docs.length < 3) {
                    setHasMore(false);
                }
             } catch (error) {
                 console.error("Error fetching initial reels:", error);
             } finally {
                 setIsLoading(false);
             }
        };
        fetchInitialReels();
    }, [firestore]);

    const lastReelElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchNextReels();
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore, fetchNextReels]);
    
    const handleDeleteReel = (id: string) => {
        setAllReels(prevReels => prevReels.filter(r => r.id !== id));
    }
    
    const handleCreateClick = () => {
        if (!user) {
            router.push('/login?from=/reels');
            return;
        }
        setShowCreateReel(true);
    }

    return (
        <div className="flex h-screen w-full bg-black">
            <SocialSidebar />
             {showCreateReel && <CreateReelForm onClose={() => setShowCreateReel(false)} />}
            <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
                <div className="absolute top-4 right-4 z-10">
                     <Button onClick={handleCreateClick}>
                        <Plus className="mr-2 h-4 w-4" /> Créer un Reel
                    </Button>
                </div>
                <div className="h-full w-full max-w-sm flex-shrink-0 snap-y snap-mandatory overflow-y-scroll scrollbar-hide" id="reels-container">
                    {(isLoading && allReels.length === 0) && (
                        <div className="h-full w-full flex items-center justify-center snap-start">
                             <Skeleton className="h-[95%] w-[95%] rounded-2xl" />
                        </div>
                    )}
                    {allReels.map((reel, index) => (
                        <div
                            ref={allReels.length === index + 1 ? lastReelElementRef : null}
                            key={reel.id}
                            id={`reel-${reel.id}`}
                            className="h-full w-full flex justify-center items-center snap-start py-4"
                        >
                            <ReelCard reel={reel} onDelete={handleDeleteReel} />
                        </div>
                    ))}
                     {isLoading && allReels.length > 0 && (
                        <div className="h-full w-full flex items-center justify-center snap-start">
                            <Skeleton className="h-[95%] w-[95%] rounded-2xl" />
                        </div>
                    )}
                     {!isLoading && allReels.length === 0 && (
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
