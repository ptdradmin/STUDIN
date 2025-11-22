

'use client';

import Image from "next/image";
import type { Post } from "@/lib/types";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, MoreHorizontal, AlertCircle, UserX, MapPin } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUser, useFirestore } from "@/firebase";
import { doc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";


interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [comment, setComment] = useState('');

    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length > 1 && parts[0] && parts[1]) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    const timeAgo = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr }) : '';

    const isOwner = user && user.uid === post.userId;
    const hasLiked = user && post.likes?.includes(user.uid);

    const handleReport = () => {
        toast({
            title: "Fonctionnalité en développement",
            description: "Le signalement de contenu sera bientôt disponible.",
        });
    };

    const handleBlock = () => {
        toast({
            title: "Fonctionnalité en développement",
            description: "Le blocage d'utilisateurs sera bientôt disponible.",
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

        try {
            if (hasLiked) {
                await updateDoc(postRef, {
                    likes: arrayRemove(user.uid)
                });
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(user.uid)
                });
            }
        } catch (error) {
            console.error("Error liking post: ", error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le like." });
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore || !comment.trim()) {
            return;
        }

        const postRef = doc(firestore, "posts", post.id);
        const newComment = {
            userId: user.uid,
            userDisplayName: user.displayName || user.email?.split('@')[0] || 'Anonyme',
            text: comment
        };
        
        try {
            await updateDoc(postRef, {
                comments: arrayUnion(newComment)
            });
            setComment('');
        } catch (error) {
            console.error("Error adding comment: ", error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'ajouter le commentaire." });
        }
    }


    const handleDelete = async () => {
        if (!firestore || !isOwner) return;
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) {
            try {
                await deleteDoc(doc(firestore, "posts", post.id));
                toast({ title: "Succès", description: "Publication supprimée." });
            } catch (error) {
                console.error("Error deleting post: ", error);
                toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer la publication." });
            }
        }
    };


    return (
        <Card className="rounded-none md:rounded-lg border-x-0 md:border-x">
            <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={post.userAvatarUrl} alt={post.userDisplayName} />
                            <AvatarFallback>{getInitials(post.userDisplayName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <span className="font-semibold text-sm">{post.userDisplayName}</span>
                            {post.location && (
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {post.location}
                                </p>
                            )}
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{timeAgo}</span>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {isOwner ? (
                                     <>
                                        <DropdownMenuItem disabled>Modifier</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                            Supprimer
                                        </DropdownMenuItem>
                                     </>
                                ) : (
                                    <>
                                        <DropdownMenuItem onClick={handleReport}>
                                            <AlertCircle className="mr-2 h-4 w-4" />
                                            Signaler
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleBlock}>
                                            <UserX className="mr-2 h-4 w-4" />
                                            Bloquer cet utilisateur
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {post.imageUrl && (
                    <div className="relative aspect-square">
                        <Image
                            src={post.imageUrl}
                            alt={`Post by ${post.userDisplayName}`}
                            fill
                            className="object-cover"
                            data-ai-hint="social media post"
                        />
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-3 flex flex-col items-start">
                <div className="flex items-center gap-2 -ml-2">
                    <Button variant="ghost" size="icon" onClick={handleLike}>
                        <Heart className={`h-6 w-6 ${hasLiked ? 'text-red-500 fill-current' : ''}`} />
                    </Button>
                    <Button variant="ghost" size="icon"><MessageCircle className="h-6 w-6" /></Button>
                    <Button variant="ghost" size="icon"><Send className="h-6 w-6" /></Button>
                </div>
                <p className="font-semibold text-sm mt-2">{post.likes?.length || 0} J'aime</p>
                <div className="text-sm mt-1">
                    <span className="font-semibold">{post.userDisplayName}</span>
                    <span className="ml-2">{post.caption}</span>
                </div>
                
                {post.comments?.length > 0 && (
                    <div className="mt-2 text-sm w-full">
                         <p className="text-muted-foreground text-xs uppercase mb-2">
                            Voir les {post.comments.length} commentaires
                        </p>
                        <div className="space-y-1">
                            {post.comments.slice(0,2).map((comment, index) => (
                                <div key={index}>
                                    <span className="font-semibold">{comment.userDisplayName}</span>
                                    <span className="ml-2 text-muted-foreground">{comment.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {user && (
                    <form onSubmit={handleCommentSubmit} className="flex w-full items-center gap-2 pt-3 mt-3 border-t">
                        <Input 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Ajouter un commentaire..." 
                            className="h-8 border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                        />
                        <Button type="submit" variant="ghost" size="sm" disabled={!comment.trim()}>
                            Publier
                        </Button>
                    </form>
                )}
            </CardFooter>
        </Card>
    );
}
