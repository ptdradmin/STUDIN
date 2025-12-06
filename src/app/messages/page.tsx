'use client';

import SocialSidebar from "@/components/social-sidebar";
import { MessageSquare, MoreHorizontal, Sparkles, Trash2 } from "lucide-react";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, orderBy, deleteDoc, doc } from "firebase/firestore";
import type { Conversation } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";


function ConversationList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const params = useParams();
    const { toast } = useToast();
    const currentConversationId = params?.id;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

    const conversationsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'conversations'),
            where('participantIds', 'array-contains', user.uid)
        );
    }, [firestore, user]);

    const { data: conversations, isLoading } = useCollection<Conversation>(conversationsQuery);

    const sortedConversations = useMemo(() => {
        if (!conversations) return [];
        return conversations.sort((a, b) => {
            const dateA = a.updatedAt?.toDate() || new Date(0);
            const dateB = b.updatedAt?.toDate() || new Date(0);
            return dateB.getTime() - dateA.getTime();
        });
    }, [conversations]);

    const handleDeleteClick = (e: React.MouseEvent, convId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setConversationToDelete(convId);
        setDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!conversationToDelete || !firestore) return;
        
        try {
            await deleteDoc(doc(firestore, "conversations", conversationToDelete));
            toast({ title: "Conversation supprimée", description: "La conversation a été supprimée avec succès." });
        } catch (error) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer la conversation." });
            console.error("Error deleting conversation:", error);
        } finally {
            setConversationToDelete(null);
            setDialogOpen(false);
        }
    };


    if (isLoading) {
        return (
            <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-grow space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!sortedConversations || sortedConversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                <MessageSquare className="h-24 w-24 text-muted-foreground" strokeWidth={1} />
                <h2 className="text-xl font-bold mt-4">Aucune conversation</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Commencez une nouvelle conversation depuis le profil d'un utilisateur ou parlez à l'assistante Alice.
                </p>
            </div>
        )
    }
    
    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }
    
    return (
        <div className="flex-grow overflow-y-auto">
            {/* Alice Assistant */}
            <Link href="/ai-chat">
                <div className={cn("p-4 flex items-start gap-3 hover:bg-muted/50 cursor-pointer border-b bg-gradient-to-r from-primary/10 to-card")}>
                     <Avatar className="h-12 w-12 border-2 border-primary/50">
                        <div className="h-full w-full flex items-center justify-center bg-primary/20">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                    </Avatar>
                    <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold truncate">Alice</p>
                            <Badge variant="secondary" className="text-xs">Assistante</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                           Votre assistante pour la vie étudiante.
                        </p>
                    </div>
                </div>
            </Link>


            {sortedConversations.map(conv => {
                const otherParticipantId = conv.participantIds.find(id => id !== user?.uid);
                const otherParticipant = otherParticipantId ? conv.participants[otherParticipantId] : null;
                const lastMessage = conv.lastMessage;
                const timeAgo = lastMessage?.timestamp ? formatDistanceToNow(lastMessage.timestamp.toDate(), { addSuffix: true, locale: fr }) : '';
                const isUnread = conv.unread && lastMessage?.senderId !== user?.uid;
                const isActive = currentConversationId === conv.id;

                if (!otherParticipant) return null;

                return (
                    <div key={conv.id} className="group relative">
                        <Link href={`/messages/${conv.id}`}>
                            <div className={cn("p-4 flex items-start gap-3 hover:bg-muted/50 cursor-pointer border-b", isActive && "bg-muted")}>
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={otherParticipant.profilePicture} />
                                    <AvatarFallback>{getInitials(otherParticipant.username)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold truncate">{otherParticipant.username}</p>
                                        <p className="text-xs text-muted-foreground flex-shrink-0">{timeAgo}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={cn("text-sm text-muted-foreground truncate", isUnread && "font-bold text-foreground")}>
                                        {lastMessage?.senderId === user?.uid && "Vous: "}{lastMessage?.text || "..."}
                                        </p>
                                        {isUnread && <span className="h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0 ml-2"></span>}
                                    </div>
                                </div>
                            </div>
                        </Link>
                         <div className="absolute top-1/2 -translate-y-1/2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                     <DropdownMenuItem onSelect={(e) => handleDeleteClick(e, conv.id)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4"/>
                                        Supprimer la conversation
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                );
            })}
             <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cette conversation ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. Tous les messages de cette conversation seront définitivement supprimés.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConversationToDelete(null)}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


export default function MessagesPage() {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[350px_1fr]">
                <aside className="border-r flex flex-col h-screen">
                    <div className="p-4 border-b">
                         <h1 className="text-2xl font-bold">Messages</h1>
                    </div>
                   <ConversationList />
                </aside>
                <main className="hidden md:flex flex-col items-center justify-center text-center p-8 bg-muted/50">
                    <MessageSquare className="h-24 w-24 text-muted-foreground" strokeWidth={1} />
                    <h1 className="text-2xl font-bold mt-4">Sélectionnez une conversation</h1>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                        Choisissez une conversation dans la liste pour afficher les messages.
                    </p>
                </main>
            </div>
        </div>
    );
}
