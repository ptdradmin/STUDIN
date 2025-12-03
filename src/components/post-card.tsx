
'use client';

import Image from "next/image";
import type { Post, Favorite } from "@/lib/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, MoreHorizontal, AlertCircle, UserX, Bookmark, Trash2, Music } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUser, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { doc, updateDoc, arrayUnion, Timestamp, collection, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toggleFavorite, createNotification } from "@/lib/actions";


interface PostCardProps {
    post: Post;
    isInitiallySaved?: boolean;
    initialFavoriteId?: string | null;
}

export default function PostCard({ post, isInitiallySaved = false, initialFavoriteId = null }: PostCardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [comment, setComment] = useState('');
    const [optimisticLikes, setOptimisticLikes] = useState(post.likes || []);
    const [optimisticComments, setOptimisticComments] = useState(post.comments || []);
    const [showAllComments, setShowAllComments] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isSaved, setIsSaved] = useState(isInitiallySaved);
    
    useEffect(() => {
        setIsSaved(isInitiallySaved);
    }, [isInitiallySaved]);

     useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    audio.play().catch(() => {}); // Autoplay might be blocked
                } else {
                    audio.pause();
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(audio);

        return () => {
            observer.disconnect();
            audio.pause();
        };
    }, [post.audioUrl]);


    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length > 1 && parts[0] && parts[1]) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    const getSafeDate = (dateValue: any): Date => {
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
    }

    const createdAtDate = getSafeDate(post.createdAt);
    const timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true, locale: fr });

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

    const handleLike = async () => {
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

        try {
            await updateDoc(postRef, { likes: newLikes });

            if (isLiking && post.userId !== user.uid) {
                await createNotification(firestore, {
                    type: 'like',
                    senderId: user.uid,
                    recipientId: post.userId,
                    relatedId: post.id,
                    message: 'a aimé votre publication.',
                });
            }
        } catch (serverError) {
             setOptimisticLikes(currentLikes);
             const permissionError = new FirestorePermissionError({
                path: postRef.path,
                operation: 'update',
                requestResourceData: { likes: newLikes }
            });
            errorEmitter.emit('permission-error', permissionError);
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
             toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.'});
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


    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore || !comment.trim()) return;

        const postRef = doc(firestore, "posts", post.id);
        const newComment = {
            userId: user.uid,
            username: user.displayName?.split(' ')[0] || 'Anonyme',
            userAvatarUrl: user.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`,
            text: comment,
            createdAt: new Date().toISOString(),
        };
        
        const previousComments = optimisticComments;
        setOptimisticComments([...previousComments, newComment]);
        const submittedComment = comment;
        setComment('');

        try {
            await updateDoc(postRef, { comments: arrayUnion(newComment) });
            if (post.userId !== user.uid) {
                await createNotification(firestore, {
                    type: 'comment',
                    senderId: user.uid,
                    recipientId: post.userId,
                    relatedId: post.id,
                    message: `a commenté : "${submittedComment.substring(0,20)}..."`,
                });
            }
        } catch (serverError) {
             setOptimisticComments(previousComments);
             const permissionError = new FirestorePermissionError({
                path: postRef.path,
                operation: 'update',
                requestResourceData: { comments: arrayUnion(newComment) }
            });
            errorEmitter.emit('permission-error', permissionError);
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
        <div className="w-full bg-card text-card-foreground border-b">
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
            
            {post.imageUrl && (
                <div className="relative aspect-square bg-muted">
                    <Image
                        src={post.imageUrl}
                        alt={`Post by ${post.username}`}
                        fill
                        className="object-cover"
                        data-ai-hint="social media post"
                    />
                    {post.audioUrl && (
                        <div className="absolute bottom-4 left-4 right-4 text-white text-xs flex items-center overflow-hidden">
                             <Music className="h-4 w-4 mr-2 flex-shrink-0" />
                            <div className="relative w-full whitespace-nowrap">
                                <span className="inline-block animate-marquee">{post.songTitle}</span>
                            </div>
                            <audio ref={audioRef} src={post.audioUrl} loop />
                        </div>
                    )}
                </div>
            )}

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
                 <p className="text-xs text-muted-foreground uppercase mt-2 px-2">{timeAgo}</p>
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
