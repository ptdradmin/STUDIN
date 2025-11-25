'use client';

import { useFirestore, useUser } from "@/firebase";
import { useCollection, useMemoFirebase } from "@/firebase/firestore/use-collection";
import type { Conversation, UserProfile } from "@/lib/types";
import { collection, query, where } from "firebase/firestore";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import SocialSidebar from "@/components/social-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

function ConversationList() {
    const { user } = useUser();
    const firestore = useFirestore();

    const conversationsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'conversations'), where('participantIds', 'array-contains', user.uid));
    }, [user, firestore]);

    const { data: conversations, isLoading } = useCollection<Conversation>(conversationsQuery);

    const getOtherParticipant = (convo: Conversation) => {
        const otherId = convo.participantIds.find(id => id !== user?.uid);
        return otherId ? convo.participants[otherId] : null;
    }
    
     const getInitials = (name?: string) => {
        if (!name) return "..";
        return name.split(' ').map(n => n[0]).join('');
    }

    if (isLoading) {
        return (
             <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted animate-pulse">
                        <div className="h-12 w-12 rounded-full bg-background"></div>
                        <div className="flex-grow space-y-2">
                            <div className="h-4 w-24 bg-background rounded"></div>
                            <div className="h-3 w-40 bg-background rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
    
    if (!conversations || conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 h-full">
                <MessageSquare className="h-24 w-24 text-muted-foreground" strokeWidth={1} />
                <h2 className="text-xl font-bold mt-4">Aucune conversation</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Commencez une nouvelle conversation depuis le profil d'un utilisateur.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-1">
            {conversations
              .sort((a, b) => b.updatedAt?.toMillis() - a.updatedAt?.toMillis())
              .map(convo => {
                const otherParticipant = getOtherParticipant(convo);
                const timeAgo = convo.updatedAt ? formatDistanceToNow(convo.updatedAt.toDate(), { addSuffix: true, locale: fr }) : '';

                if (!otherParticipant) return null;

                return (
                    <Link href={`/messages/${convo.id}`} key={convo.id}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={otherParticipant.profilePicture} />
                                <AvatarFallback>{getInitials(otherParticipant.username)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold truncate">{otherParticipant.username}</p>
                                    <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo}</span>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">
                                    {convo.lastMessage?.senderId === user?.uid && "Vous: "}
                                    {convo.lastMessage?.text || "Aucun message"}
                                </p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}


export default function MessagesPage() {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[350px_1fr]">
                <aside className="border-r flex flex-col">
                    <div className="p-4 border-b">
                         <h1 className="text-2xl font-bold">Messages</h1>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        <ConversationList />
                    </div>
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
