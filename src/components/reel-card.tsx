
'use client';

import type { Reel } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Send, MoreHorizontal, Volume2, VolumeX, Play, Pause } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import Link from "next/link";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "./ui/progress";

interface ReelCardProps {
    reel: Reel;
}

export default function ReelCard({ reel }: ReelCardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [optimisticLikes, setOptimisticLikes] = useState(reel.likes || []);
    const hasLiked = user && optimisticLikes.includes(user.uid);

    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoRef.current?.play();
                    setIsPlaying(true);
                } else {
                    videoRef.current?.pause();
                    setIsPlaying(false);
                }
            },
            { threshold: 0.5 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current);
            }
        };
    }, []);

    const handleVideoClick = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(currentProgress);
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('');
    };
    
    const handleLike = () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
            return;
        }

        const reelRef = doc(firestore, "reels", reel.id);
        const currentLikes = optimisticLikes;
        const newLikes = hasLiked
            ? currentLikes.filter(uid => uid !== user.uid)
            : [...currentLikes, user.uid];

        setOptimisticLikes(newLikes);

        updateDoc(reelRef, { likes: newLikes })
            .catch(serverError => {
                setOptimisticLikes(currentLikes);
                const permissionError = new FirestorePermissionError({
                    path: reelRef.path,
                    operation: 'update',
                    requestResourceData: { likes: newLikes }
                });
                errorEmitter.emit('permission-error', permissionError);
            });
    }

    return (
        <div className="relative h-full w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden bg-background shadow-lg group">
            <video
                ref={videoRef}
                src={reel.videoUrl}
                loop
                muted={isMuted}
                playsInline
                className="h-full w-full object-cover"
                onClick={handleVideoClick}
                onTimeUpdate={handleTimeUpdate}
            ></video>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

            <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" className="text-white bg-black/30 h-8 w-8" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
            </div>
            
            {!isPlaying && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <Play className="h-16 w-16 text-white/50" />
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white flex justify-between items-end">
                <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-2">
                        <Link href={`/profile/${reel.userId}`}>
                           <Avatar className="h-9 w-9 border-2 border-white">
                                <AvatarImage src={reel.userAvatarUrl} />
                                <AvatarFallback>{getInitials(reel.username)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <Link href={`/profile/${reel.userId}`}>
                            <p className="font-semibold text-sm drop-shadow">{reel.username}</p>
                        </Link>
                    </div>
                    <p className="text-sm drop-shadow">{reel.caption}</p>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                    <Button variant="ghost" size="icon" className="text-white h-12 w-12" onClick={handleLike}>
                        <div className="flex flex-col items-center">
                            <Heart className={`h-7 w-7 ${hasLiked ? 'text-red-500 fill-red-500' : ''}`} />
                            <span className="text-xs font-semibold">{optimisticLikes.length}</span>
                        </div>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white h-12 w-12">
                        <div className="flex flex-col items-center">
                            <MessageCircle className="h-7 w-7" />
                            <span className="text-xs font-semibold">{reel.comments.length}</span>
                        </div>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white h-12 w-12">
                         <Send className="h-7 w-7" />
                    </Button>
                     <Button variant="ghost" size="icon" className="text-white h-12 w-12">
                         <MoreHorizontal className="h-7 w-7" />
                    </Button>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1">
                <Progress value={progress} className="h-1 bg-white/20 [&>div]:bg-white" />
            </div>
        </div>
    );
}
