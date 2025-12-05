

'use client';

import Image from "next/image";
import type { Post } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, MoreHorizontal, AlertCircle, UserX, Bookmark, Trash2, Music, Loader2, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUser, useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { doc, arrayUnion, Timestamp } from "firebase/firestore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toggleFavorite, createNotification } from "@/lib/actions";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


interface PostCardProps {
    post: Post;
    isInitiallySaved?: boolean;
    initialFavoriteId?: string | null;
}

const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mN8/w8AAusB/2+B2XAAAAAASUVORK5CYII=";


export default function PostCard({ post, isInitiallySaved = false }: PostCardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [comment, setComment] = useState('');
    const [optimisticLikes, setOptimisticLikes] = useState(post.likes || []);
    const [optimisticComments, setOptimisticComments] = useState(post.comments || []);
    const [showAllComments, setShowAllComments] = useState(false);
    const [isSaved, setIsSaved] = useState(isInitiallySaved);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);

    const [isClient, setIsClient] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(cardRef, { amount: 0.5 });


    useEffect(() => {
        setIsClient(true);
    }, []);

    const getSafeDate = useCallback((dateValue: any): Date => {
        if (!dateValue) return new Date();
        if (dateValue instanceof Timestamp) {
            return dateValue.toDate();
        }
        if (typeof dateValue === 'object' && 'seconds' in dateValue && 'nanoseconds' in dateValue) {
            return new Timestamp(dateValue.seconds, dateValue.nanoseconds).toDate();
        }
        if (typeof dateValue === 'string' || typeof dateValue === 'number') {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        return new Date();
    }, []);

    const [timeAgo, setTimeAgo] = useState(() => format(getSafeDate(post.createdAt), 'PP', { locale: fr }));

    useEffect(() => {
        if (isClient) {
            const date = getSafeDate(post.createdAt);
            const update = () => setTimeAgo(formatDistanceToNow(date, { addSuffix: true, locale: fr }));
            update();
            const timer = setInterval(update, 60000);
            return () => clearInterval(timer);
        }
    }, [isClient, post.createdAt, getSafeDate]);

    useEffect(() => {
        setIsSaved(isInitiallySaved);
    }, [isInitiallySaved]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isInView && !isPlaying) {
            video.play().catch(() => { }); // Autoplay might be blocked
        } else if (!isInView && isPlaying) {
            video.pause();
        }

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };

    }, [isInView, isPlaying]);


    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length > 1 && parts[0] && parts[1]) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }


    const isOwner = user && user.uid === post.userId;
    const hasLiked = user && optimisticLikes.includes(user.uid);

    const handleReport = () => {
        toast({
            title: "Publication signalée",
            description: "Merci, nous allons examiner cette publication.",
        });
    };

    const handleBlock = () => {
        toast({
            title: "Utilisateur bloqué",
            description: "Vous ne verrez plus les publications de cet utilisateur.",
        });
    };

    const handlePlayPause = useCallback(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(() => { });
            if (audio) audio.play().catch(() => { });
        } else {
            video.pause();
            if (audio) audio.pause();
        }
    }, []);

    const toggleMute = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    }, [isMuted]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
        if (videoRef.current) {
            videoRef.current.muted = post.audioUrl ? true : isMuted;
        }
    }, [isMuted, post.audioUrl]);


    const handleLike = () => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Erreur',
                description: 'Vous devez être connecté pour aimer une publication.'
            });
            return;
        }

        const postRef = doc(firestore, "posts", post.id);
        const currentLikes = optimisticLikes;
        const isLiking = !hasLiked;

        const newLikes = isLiking
            ? [...currentLikes, user.uid]
            : currentLikes.filter(uid => uid !== user.uid);

        setOptimisticLikes(newLikes);

        if (isLiking) {
            setShowLikeAnimation(true);
            setTimeout(() => setShowLikeAnimation(false), 800);
        }

        updateDocumentNonBlocking(postRef, { likes: newLikes });

        if (isLiking && post.userId !== user.uid) {
            createNotification(firestore, {
                type: 'like',
                senderId: user.uid,
                recipientId: post.userId,
                relatedId: post.id,
                message: 'a aimé votre publication.',
            });
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        toast({
            title: "Lien copié !",
            description: "Le lien vers la publication a été copié dans votre presse-papiers.",
        })
    }

    const handleSave = async () => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
            return;
        }

        const wasSaved = isSaved;
        setIsSaved(!wasSaved);
        try {
            await toggleFavorite(firestore, user.uid, { id: post.id, type: 'post' }, wasSaved);
            toast({ title: wasSaved ? 'Retiré des favoris' : 'Ajouté aux favoris' });
        } catch (error) {
            setIsSaved(wasSaved);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour les favoris.' });
        }
    };


    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore || !comment.trim()) return;

        const postRef = doc(firestore, "posts", post.id);
        const newComment = {
            userId: user.uid,
            username: user.displayName?.split(' ')[0] || 'Anonyme',
            userAvatarUrl: user.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`,
            text: comment,
            createdAt: Timestamp.now(),
        };

        const previousComments = optimisticComments;
        setOptimisticComments([...previousComments, newComment]);
        const submittedComment = comment;
        setComment('');

        updateDocumentNonBlocking(postRef, { comments: arrayUnion(newComment) });
        
        if (post.userId !== user.uid) {
            createNotification(firestore, {
                type: 'comment',
                senderId: user.uid,
                recipientId: post.userId,
                relatedId: post.id,
                message: `a commenté : "${submittedComment.substring(0, 20)}..."`,
            });
        }
    }


    const handleDelete = async () => {
        if (!firestore || !isOwner) return;
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) {
            deleteDocumentNonBlocking(doc(firestore, "posts", post.id));
            toast({ title: "Succès", description: "Publication supprimée." });
        }
    };

    const displayedComments = showAllComments ? optimisticComments : optimisticComments.slice(0, 1);


    return (
        <div ref={cardRef} className="w-full bg-card text-card-foreground border-b rounded-lg">
            <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.userId}`}>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={post.userAvatarUrl} alt={post.username} />
                            <AvatarFallback>{getInitials(post.username)}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="grid gap-0.5">
                        <Link href={`/profile/${post.userId}`}>
                            <span className="font-semibold text-sm cursor-pointer hover:underline">{post.username}</span>
                        </Link>
                        {post.location && (
                            <p className="text-xs text-muted-foreground flex items-center cursor-pointer hover:underline">
                                {post.location}
                            </p>
                        )}
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {isOwner ? (
                            <>
                                <DropdownMenuItem disabled>Modifier</DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer
                                </DropdownMenuItem>
                            </>
                        ) : (
                            <>
                                <DropdownMenuItem onClick={handleReport} className="cursor-pointer">
                                    <AlertCircle className="mr-2 h-4 w-4" />
                                    Signaler
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleBlock} className="text-destructive focus:text-destructive cursor-pointer">
                                    <UserX className="mr-2 h-4 w-4" />
                                    Bloquer cet utilisateur
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="relative aspect-square bg-muted" onDoubleClick={handleLike}>
                {showLikeAnimation && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <Heart className="h-24 w-24 text-white/90 drop-shadow-lg animate-in fade-in zoom-in-125" />
                    </div>
                )}
                {post.isUploading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : post.fileType === 'video' && post.videoUrl ? (
                    <>
                        <video ref={videoRef} src={post.videoUrl} loop playsInline className="w-full h-full object-cover bg-black" onClick={handlePlayPause} />
                        {post.audioUrl && <audio ref={audioRef} src={post.audioUrl} loop />}
                        {!isPlaying && isClient && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                                <Play className="h-20 w-20 text-white/70 drop-shadow-lg" />
                            </div>
                        )}
                        <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 z-10 text-white bg-black/30 hover:bg-black/50" onClick={toggleMute}>
                            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </Button>
                    </>
                ) : post.imageUrl ? (
                    <Image
                        src={post.imageUrl}
                        alt={`Post by ${post.username}`}
                        fill
                        className="object-cover"
                        data-ai-hint="social media post"
                        placeholder="blur"
                        blurDataURL={BLUR_DATA_URL}
                    />
                ) : null}
            </div>

            <div className="p-3 flex flex-col items-start">
                <div className="flex items-center justify-between w-full -ml-2">
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={handleLike}>
                            <Heart className={`h-6 w-6 transition-colors ${hasLiked ? 'text-red-500 fill-current' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <label htmlFor={`comment-input-${post.id}`} className="cursor-pointer">
                                <MessageCircle className="h-6 w-6" />
                            </label>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleShare}><Send className="h-6 w-6" /></Button>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleSave}>
                        <Bookmark className={`h-6 w-6 ${isSaved ? 'fill-current' : ''}`} />
                    </Button>
                </div>
                {optimisticLikes.length > 0 && <p className="font-semibold text-sm mt-1 px-2">{optimisticLikes.length} J'aime</p>}
                <div className="text-sm mt-1 px-2">
                    <Link href={`/profile/${post.userId}`}>
                        <span className="font-semibold cursor-pointer hover:underline">{post.username}</span>
                    </Link>
                    <span className="ml-2">{post.caption}</span>
                </div>
                {post.songTitle && (
                    <div className="px-2 mt-1">
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Music className="h-3 w-3" />
                            <a href={post.audioUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{post.songTitle}</a>
                        </span>
                    </div>
                )}

                {optimisticComments.length > 1 && !showAllComments && (
                    <Button variant="link" className="p-0 h-auto text-muted-foreground text-sm mt-1 px-2" onClick={() => setShowAllComments(true)}>
                        Voir les {optimisticComments.length} commentaires
                    </Button>
                )}

                {optimisticComments.length > 0 && (
                    <div className="mt-2 text-sm w-full space-y-1 px-2">
                        {displayedComments.map((comment, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <Link href={`/profile/${comment.userId}`}>
                                    <span className="font-semibold cursor-pointer hover:underline">{comment.username}</span>
                                </Link>
                                <span className="">{comment.text}</span>
                            </div>
                        ))}
                    </div>
                )}

                {optimisticComments.length > 1 && showAllComments && (
                    <Button variant="link" className="p-0 h-auto text-muted-foreground text-sm mt-1 px-2" onClick={() => setShowAllComments(false)}>
                        Masquer les commentaires
                    </Button>
                )}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground uppercase mt-2 px-2 cursor-default">{timeAgo}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{format(getSafeDate(post.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

            </div>
            {user && (
                <div className="border-t px-3 py-1">
                    <form onSubmit={handleCommentSubmit} className="flex w-full items-center gap-2">
                        <Input
                            id={`comment-input-${post.id}`}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Ajouter un commentaire..."
                            className="h-9 border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-transparent text-sm"
                        />
                        <Button type="submit" variant="ghost" size="sm" disabled={!comment.trim()} className="text-primary font-semibold hover:text-primary">
                            Publier
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
}
