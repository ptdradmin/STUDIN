

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
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // This effect ensures that whenever a new reel comes into view, its audio track is loaded.
    useEffect(() => {
        if (reel.audioUrl && audioRef.current) {
            if (audioRef.current.src !== reel.audioUrl) {
                audioRef.current.src = reel.audioUrl;
                audioRef.current.load();
            }
        }
    }, [reel.audioUrl]);

     const playMedia = async () => {
        if (!videoRef.current) return;
        setIsPlaying(true);
        videoRef.current.play().catch(e => {
            if (e.name !== 'AbortError') console.error("Video play error:", e);
        });

        if (audioRef.current) {
            audioRef.current.currentTime = videoRef.current.currentTime;
            audioRef.current.muted = isMuted;
            audioRef.current.play().catch(e => {
                if (e.name !== 'AbortError') console.error("Audio play error:", e);
            });
        }
    };

    const pauseMedia = () => {
        if (videoRef.current) videoRef.current.pause();
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
    };
    
    const togglePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card-level events
        if (isPlaying) {
            pauseMedia();
        } else {
            playMedia();
        }
    };
    
    // Auto-pause when scrolling away
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    pauseMedia();
                } else {
                    // Optional: autoplay if desired and allowed
                    // playMedia(); 
                }
            },
            { threshold: 0.5 } // Trigger when 50% of the video is out of view
        );

        const currentVideoRef = videoRef.current;
        if (currentVideoRef) {
            observer.observe(currentVideoRef);
        }

        return () => {
            if (currentVideoRef) {
                observer.unobserve(currentVideoRef);
            }
            pauseMedia();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reel.id]);


    const handleTimeUpdate = () => {
        if (videoRef.current?.duration) {
            const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(currentProgress);
        }
    };

    const handleVideoEnd = () => {
        if (videoRef.current) videoRef.current.currentTime = 0;
        if (audioRef.current) audioRef.current.currentTime = 0;
        playMedia();
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
                playsInline
                loop
                muted={true} // The main video is ALWAYS muted. Sound comes from the separate audio element.
                className="h-full w-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                id={`reel-video-${reel.id}`}
            ></video>

            {reel.audioUrl && (
                <audio
                    ref={audioRef}
                    src={reel.audioUrl}
                    loop
                ></audio>
            )}

            <div className="absolute inset-0" onClick={togglePlayPause}></div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
            
            {!isPlaying && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" onClick={togglePlayPause}>
                    <Play className="h-20 w-20 text-white/70" />
                </div>
            )}


            <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" className="text-white bg-black/30 h-8 w-8" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white flex justify-between items-end z-10">
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

            <div className="absolute bottom-0 left-0 right-0 h-1 z-10">
                <Progress value={progress} className="h-1 bg-white/20 [&>div]:bg-white" />
            </div>
        </div>
    );
}
