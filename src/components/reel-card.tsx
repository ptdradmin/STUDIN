

'use client';

import type { Reel } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Send, MoreHorizontal, EyeOff, Link as LinkIcon, Trash2, Music, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase";
import Link from "next/link";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
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
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isVisible, setIsVisible] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const hasLiked = user && optimisticLikes.includes(user.uid);
    const isOwner = user?.uid === reel.userId;

    useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video) return;

        const handlePlay = () => {
            if (audio) {
                audio.currentTime = video.currentTime;
                audio.play().catch(e => console.error("Audio play error:", e));
            }
        };

        const handlePause = () => audio?.pause();
        const handleSeeking = () => {
             if (audio) audio.currentTime = video.currentTime;
        }

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('seeking', handleSeeking);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('seeking', handleSeeking);
        }
    }, [reel.audioUrl]);

    useEffect(() => {
        if(audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);

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
    
    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(e => console.log(e));
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }


    if (!isVisible) return null;

    return (
        <div ref={cardRef} className="relative h-full w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-lg group">
             <video
                ref={videoRef}
                src={reel.videoUrl}
                playsInline
                loop
                muted={!reel.audioUrl} // Mute video only if there IS background music
                onClick={togglePlay}
                className="h-full w-full object-cover"
            />
            {reel.audioUrl && <audio ref={audioRef} src={reel.audioUrl} loop />}

             {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                    <Play className="h-20 w-20 text-white/70 drop-shadow-lg" />
                </div>
            )}
            
            <div className="absolute top-4 right-4 z-10">
                <Button variant="ghost" size="icon" className="text-white bg-black/30 hover:bg-black/50" onClick={(e) => { e.stopPropagation(); setIsMuted(prev => !prev);}}>
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </Button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-16 md:pb-4 text-white bg-gradient-to-t from-black/60 to-transparent flex justify-between items-end z-10 pointer-events-none">
                <div className="space-y-2 flex-grow overflow-hidden">
                    <div className="flex items-center gap-2 pointer-events-auto">
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
                
                <div className="flex flex-col items-center space-y-4 pointer-events-auto">
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
        </div>
    );
}
