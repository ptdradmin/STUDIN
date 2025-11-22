
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where, getDocs, doc, addDoc, serverTimestamp, updateDoc, orderBy, Timestamp } from 'firebase/firestore';
import type { Conversation, ChatMessage, UserProfile } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

function ConversationListSkeleton() {
    return (
        <div className="divide-y">
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="w-full space-y-2">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

function ChatWindowSkeleton() {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-24" />
            </div>
            <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto">
                <div className="flex justify-start"><Skeleton className="h-12 w-48 rounded-lg" /></div>
                <div className="flex justify-end"><Skeleton className="h-16 w-56 rounded-lg" /></div>
                <div className="flex justify-start"><Skeleton className="h-10 w-32 rounded-lg" /></div>
            </CardContent>
            <div className="p-4 border-t bg-background">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 flex-grow" />
                    <Skeleton className="h-10 w-10" />
                </div>
            </div>
        </div>
    )
}

function PageSkeleton() {
    return (
         <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto my-8">
                <Skeleton className="h-[calc(100vh-200px)] w-full" />
            </main>
            <Footer />
        </div>
    )
}


export default function MessagesPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch user's conversations
    const conversationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'conversations'), where('participantIds', 'array-contains', user.uid));
    }, [firestore, user]);
    const { data: conversations, isLoading: conversationsLoading } = useCollection<Conversation>(conversationsQuery);
    
    // Fetch messages for the selected conversation
    const messagesQuery = useMemoFirebase(() => {
        if (!firestore || !selectedConversation) return null;
        return query(collection(firestore, 'conversations', selectedConversation.id, 'messages'), orderBy('createdAt', 'asc'));
    }, [firestore, selectedConversation]);
    const { data: messages, isLoading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);
    

    // Effect to handle redirection and pre-selection of conversation from URL
     useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login?from=/messages');
            return;
        }

        const recipientId = searchParams.get('recipient');
        if (recipientId && user && firestore && conversations !== undefined) {
            const findAndSetConversation = async () => {
                const existingConversation = conversations?.find(c => c.participantIds.includes(recipientId));
                
                if (existingConversation) {
                    setSelectedConversation(existingConversation);
                } else {
                    // Create a new conversation
                    const recipientDoc = await getDocs(query(collection(firestore, 'users'), where('id', '==', recipientId)));
                    if (recipientDoc.empty) {
                        console.error("Recipient user not found");
                        return;
                    }
                    const recipientProfile = { id: recipientDoc.docs[0].id, ...recipientDoc.docs[0].data() } as UserProfile;
                    
                    const currentUserDoc = await getDocs(query(collection(firestore, 'users'), where('id', '==', user.uid)));
                    if(currentUserDoc.empty) return;
                    const currentUserProfile = { id: currentUserDoc.docs[0].id, ...currentUserDoc.docs[0].data()} as UserProfile;


                    const newConversationRef = await addDoc(collection(firestore, 'conversations'), {
                        participantIds: [user.uid, recipientId],
                        participants: {
                            [user.uid]: currentUserProfile,
                            [recipientId]: recipientProfile
                        },
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    });
                    
                     setSelectedConversation({
                        id: newConversationRef.id,
                        participantIds: [user.uid, recipientId],
                        participants: {
                            [user.uid]: currentUserProfile,
                            [recipientId]: recipientProfile
                        },
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
            };
            findAndSetConversation();
        } else if (!recipientId && conversations && conversations.length > 0 && !selectedConversation) {
            setSelectedConversation(conversations[0]);
        }

    }, [user, isUserLoading, router, searchParams, firestore, conversations, selectedConversation]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (isUserLoading || !user) {
        return <PageSkeleton />;
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if(newMessage.trim() === '' || !firestore || !selectedConversation) return;

        const messagesColRef = collection(firestore, 'conversations', selectedConversation.id, 'messages');
        const conversationDocRef = doc(firestore, 'conversations', selectedConversation.id);

        const messageData = {
            text: newMessage,
            senderId: user.uid,
            createdAt: serverTimestamp()
        };

        await addDoc(messagesColRef, messageData);
        await updateDoc(conversationDocRef, {
            lastMessage: {
                text: newMessage,
                senderId: user.uid,
                timestamp: serverTimestamp()
            },
            updatedAt: serverTimestamp()
        });

        setNewMessage('');
    }

    const getOtherParticipant = (conv: Conversation) => {
        const otherId = conv.participantIds.find(id => id !== user.uid);
        return otherId ? conv.participants[otherId] : null;
    }

    const getInitials = (name?: string) => {
        if (!name) return "..";
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }
    
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto my-8">
                <Card className="h-[calc(100vh-200px)] flex">
                    {/* Conversations List */}
                    <div className="w-1/3 border-r">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-bold">Messages</h2>
                        </div>
                        {conversationsLoading ? <ConversationListSkeleton /> : (
                            <div className="divide-y h-[calc(100%-65px)] overflow-y-auto">
                                {conversations && conversations.map(conv => {
                                    const otherUser = getOtherParticipant(conv);
                                    const lastMessageTime = conv.lastMessage?.timestamp ? formatDistanceToNow(new Date((conv.lastMessage.timestamp as Timestamp).toDate().toISOString()), { addSuffix: true, locale: fr }) : '';

                                    return (
                                        <div 
                                            key={conv.id} 
                                            className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedConversation?.id === conv.id ? 'bg-muted' : ''}`}
                                            onClick={() => setSelectedConversation(conv)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={otherUser?.profilePicture} />
                                                    <AvatarFallback>{getInitials(otherUser?.firstName)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-grow overflow-hidden">
                                                    <div className="flex justify-between items-baseline">
                                                        <p className="font-semibold truncate">{otherUser?.firstName} {otherUser?.lastName}</p>
                                                        <p className="text-xs text-muted-foreground flex-shrink-0">{lastMessageTime}</p>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage?.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                 {!conversations?.length && (
                                     <div className="p-8 text-center text-sm text-muted-foreground">
                                        Commencez une nouvelle conversation depuis la page d'une annonce.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Chat Window */}
                    <div className="w-2/3 flex flex-col">
                        {!selectedConversation ? (
                            <div className="flex-grow flex items-center justify-center">
                                {conversationsLoading ? <ChatWindowSkeleton /> : <p className="text-muted-foreground">Sélectionnez une conversation pour commencer</p>}
                            </div>
                        ) : (
                            <>
                                <div className="p-4 border-b flex items-center gap-3">
                                     <Avatar>
                                        <AvatarImage src={getOtherParticipant(selectedConversation)?.profilePicture} />
                                        <AvatarFallback>{getInitials(getOtherParticipant(selectedConversation)?.firstName)}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-semibold">{getOtherParticipant(selectedConversation)?.firstName} {getOtherParticipant(selectedConversation)?.lastName}</h3>
                                </div>
                                <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto">
                                    {messagesLoading && <div className="text-center text-muted-foreground">Chargement des messages...</div>}
                                    {!messagesLoading && messages?.map((msg, index) => {
                                        const msgTime = msg.createdAt ? new Date((msg.createdAt as Timestamp).toDate().toISOString()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                                        return (
                                             <div key={index} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.senderId === user.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                    <p>{msg.text}</p>
                                                    <p className="text-xs text-right mt-1 opacity-70">{msgTime}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    <div ref={messagesEndRef} />
                                </CardContent>
                                <div className="p-4 border-t bg-background">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                        <Input 
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Écrivez votre message..." 
                                            className="flex-grow"
                                            disabled={messagesLoading}
                                        />
                                        <Button type="submit" size="icon" disabled={!newMessage.trim() || messagesLoading}>
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
