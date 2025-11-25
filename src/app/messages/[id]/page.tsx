
'use client';

import { useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { useCollection, useDoc } from "@/firebase/firestore/use-collection";
import type { Conversation, ChatMessage, UserProfile } from "@/lib/types";
import { collection, query, where, doc, orderBy, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import SocialSidebar from "@/components/social-sidebar";
import { FormEvent, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { createNotification } from "@/lib/actions";

function MessagesHeader({ conversation }: { conversation: Conversation | null }) {
    const { user } = useUser();
    const router = useRouter();

    if (!conversation || !user) {
        return (
             <div className="p-4 border-b flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
            </div>
        );
    }
    
    const otherParticipantId = conversation.participantIds.find(id => id !== user.uid);
    const otherParticipant = otherParticipantId ? conversation.participants[otherParticipantId] : null;

    return (
        <div className="p-4 border-b flex items-center gap-3 bg-card sticky top-0 z-10">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push('/messages')}>
                <ArrowLeft />
            </Button>
            <Link href={`/profile/${otherParticipantId}`}>
                <Avatar>
                    <AvatarImage src={otherParticipant?.profilePicture} />
                    <AvatarFallback>{otherParticipant?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            </Link>
            <p className="font-semibold">{otherParticipant?.username}</p>
        </div>
    )
}

function MessageBubble({ message, isOwnMessage }: { message: ChatMessage, isOwnMessage: boolean}) {
    return (
        <div className={`flex items-end gap-2 ${isOwnMessage ? 'justify-end' : ''}`}>
             <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{message.text}</p>
             </div>
        </div>
    )
}

export default function ConversationPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const params = useParams();
    const conversationId = params.id as string;
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const conversationRef = useMemoFirebase(() => {
        if (!firestore || !conversationId) return null;
        return doc(firestore, 'conversations', conversationId);
    }, [firestore, conversationId]);
    const { data: conversation, isLoading: isConversationLoading } = useDoc<Conversation>(conversationRef);

    const messagesQuery = useMemoFirebase(() => {
        if (!firestore || !conversationId) return null;
        return query(collection(firestore, 'conversations', conversationId, 'messages'), orderBy('createdAt', 'asc'));
    }, [firestore, conversationId]);
    const { data: messages, isLoading: areMessagesLoading } = useCollection<ChatMessage>(messagesQuery);
    
     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!user || !firestore || !conversationRef || !newMessage.trim() || !conversation) return;

        const messagesColRef = collection(firestore, 'conversations', conversationId, 'messages');
        const messageData = {
            senderId: user.uid,
            text: newMessage,
            createdAt: serverTimestamp(),
        };

        const otherParticipantId = conversation.participantIds.find(id => id !== user.uid);
        if (!otherParticipantId) return;

        setNewMessage('');
        await addDoc(messagesColRef, messageData);
        await updateDoc(conversationRef, {
            lastMessage: {
                senderId: user.uid,
                text: newMessage,
                timestamp: serverTimestamp(),
            },
            updatedAt: serverTimestamp()
        });

        await createNotification(firestore, {
            type: 'new_message',
            senderId: user.uid,
            recipientId: otherParticipantId,
            relatedId: conversationId,
            message: `vous a envoyé un message : "${newMessage.substring(0, 30)}${newMessage.length > 30 ? '...' : ''}"`
        })
    }

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex-1 flex flex-col h-screen">
                <MessagesHeader conversation={conversation} />

                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                     {(isConversationLoading || areMessagesLoading) && (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-2/3 rounded-lg" />
                            <Skeleton className="h-16 w-1/2 rounded-lg self-end ml-auto" />
                            <Skeleton className="h-8 w-1/3 rounded-lg" />
                        </div>
                    )}
                    
                    {messages && messages.map(msg => (
                        <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === user?.uid} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                 <div className="p-4 border-t bg-card sticky bottom-0">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Input 
                            placeholder="Écrivez votre message..." 
                            className="flex-grow" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isConversationLoading}
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-5 w-5"/>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
