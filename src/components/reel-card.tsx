

'use client';

import type { Reel } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Send, MoreHorizontal, Volume2, VolumeX, Play, Pause, EyeOff, Link as LinkIcon, Trash2, Music, CheckCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import Link from "next/link";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "./ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Global state to track if user has interacted to enable audio
let hasEnabledAudio = false;

interface ReelCardProps {
    reel: Reel;
    onDelete?: (id: string) => void;
}

export default function ReelCard({ reel, onDelete }: ReelCardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [optimisticLikes, setOptimisticLikes] = useState(reel.likes || []);
    const hasLiked = user && optimisticLikes.includes(user.uid);
    const isOwner = user?.uid === reel.userId;

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(!hasEnabledAudio);
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const playMedia = async () => {
        if (videoRef.current?.paused) {
            try {
                await videoRef.current.play();
                if (audioRef.current?.paused) {
                    await audioRef.current.play();
                }
                setIsPlaying(true);
            } catch (error) {
                 if ((error as DOMException).name !== 'AbortError') {
                    console.error("Media play failed:", error);
                 }
            }
        }
    };

    const pauseMedia = () => {
        if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
        }
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
        }
        setIsPlaying(false);
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (!hasEnabledAudio) {
                        setIsMuted(true);
                    }
                    playMedia();
                } else {
                    pauseMedia();
                }
            },
            { threshold: 0.5 }
        );

        const currentVideoRef = videoRef.current;
        if (currentVideoRef) {
            observer.observe(currentVideoRef);
        }

        return () => {
            if (currentVideoRef) {
                observer.unobserve(currentVideoRef);
            }
            if (videoRef.current) videoRef.current.pause();
            if (audioRef.current) audioRef.current.pause();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleVideoClick = () => {
        if (!hasEnabledAudio) {
            hasEnabledAudio = true;
            setIsMuted(false);
        }
        
        if (isPlaying) {
            pauseMedia();
        } else {
            playMedia();
        }
    };
    
    useEffect(() => {
        if(videoRef.current) {
             videoRef.current.muted = true; // Video is always muted to sync with external audio
        }
        if(audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);

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

    const handleShare = () => {
        const reelUrl = `${window.location.origin}/reels#${reel.id}`;
        navigator.clipboard.writeText(reelUrl);
        toast({
            title: "Lien copié !",
            description: "Le lien vers le Reel a été copié.",
            icon: <CheckCircle className="h-5 w-5 text-green-500" />
        });
    }
    
    const handleNotInterested = () => {
        setIsVisible(false);
        toast({
            title: "Reel masqué",
            description: "Nous vous montrerons moins de contenu de ce type."
        });
    }
    
    const handleDelete = () => {
        if (!isOwner || !firestore) return;
        deleteDoc(doc(firestore, "reels", reel.id))
            .then(() => {
                toast({ title: "Reel supprimé" });
                if(onDelete) onDelete(reel.id);
            })
            .catch(() => {
                toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer le Reel."});
            })
    }

    if (!isVisible) return null;

    return (
        <div className="relative h-full w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden bg-background shadow-lg group">
            <video
                ref={videoRef}
                src={reel.videoUrl}
                loop
                playsInline
                className="h-full w-full object-cover"
                onClick={handleVideoClick}
                onTimeUpdate={handleTimeUpdate}
                id={`reel-video-${reel.id}`}
                muted // Always mute the video element itself
            ></video>
            
            {reel.audioUrl && <audio ref={audioRef} src={reel.audioUrl} loop />}

            {!hasEnabledAudio && (
                 <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white pointer-events-none text-center p-4">
                    <VolumeX className="h-12 w-12 mb-2" />
                    <p className="font-semibold">Appuyez pour activer le son</p>
                </div>
            )}


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
                <div className="space-y-2 flex-grow overflow-hidden">
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
                     {reel.songTitle && (
                        <div className="flex items-center gap-2 text-xs">
                            <Music className="h-3 w-3" />
                            <p className="truncate">{reel.songTitle}</p>
                        </div>
                    )}
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
                    <Button variant="ghost" size="icon" className="text-white h-12 w-12" onClick={handleShare}>
                         <Send className="h-7 w-7" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white h-12 w-12">
                                 <MoreHorizontal className="h-7 w-7" />
                            </Button>
                        </DropdownMenuTrigger>
                         <DropdownMenuContent>
                            <DropdownMenuItem onSelect={handleShare}><LinkIcon className="mr-2 h-4 w-4" />Copier le lien</DropdownMenuItem>
                            {!isOwner && <DropdownMenuItem onSelect={handleNotInterested}><EyeOff className="mr-2 h-4 w-4" />Pas intéressé</DropdownMenuItem>}
                            {isOwner && <DropdownMenuItem onSelect={handleDelete} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Supprimer</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1">
                <Progress value={progress} className="h-1 bg-white/20 [&>div]:bg-white" />
            </div>
        </div>
    );
}
