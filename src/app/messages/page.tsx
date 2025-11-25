'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Trash2, MoreHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, where, getDoc, doc, addDoc, serverTimestamp, updateDoc, orderBy, Timestamp, arrayRemove } from 'firebase/firestore';
import type { Conversation, ChatMessage, UserProfile } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';
import { deleteConversation } from '@/ai/flows/delete-conversation-flow';
import Link from 'next/link';


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
         <div className="container mx-auto my-8">
            <Skeleton className="h-[calc(100vh-200px)] w-full" />
        </div>
    )
}


export default function MessagesPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

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
    }, [firestore, selectedConversation?.id]);
    const { data: messages, isLoading: messagesLoading } = useCollection<ChatMessage>(messagesQuery);

    const getSafeDate = (dateValue: any): Date | null => {
      if (!dateValue) return null;
      if (dateValue instanceof Timestamp) {
        return dateValue.toDate();
      }
      if (typeof dateValue === 'string' || typeof dateValue === 'number') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      if (typeof dateValue === 'object' && 'seconds' in dateValue && 'nanoseconds' in dateValue) {
         return new Timestamp(dateValue.seconds, dateValue.nanoseconds).toDate();
      }
      return null;
    }
    

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
                    try {
                        const recipientDocRef = doc(firestore, 'users', recipientId);
                        const recipientSnap = await getDoc(recipientDocRef).catch(error => {
                            const permError = new FirestorePermissionError({
                                path: `users/${recipientId}`, operation: 'get',
                            });
                            errorEmitter.emit('permission-error', permError);
                            throw permError;
                        });

                        if (!recipientSnap.exists()) {
                             toast({ variant: 'destructive', title: 'Erreur', description: 'Destinataire non trouvé.' });
                             return;
                        }
                        const recipientProfile = recipientSnap.data() as UserProfile;
                        
                        const currentUserDocRef = doc(firestore, 'users', user.uid);
                        const currentUserSnap = await getDoc(currentUserDocRef).catch(error => {
                            const permError = new FirestorePermissionError({
                                path: `users/${user.uid}`, operation: 'get',
                            });
                            errorEmitter.emit('permission-error', permError);
                            throw permError;
                        });

                        if(!currentUserSnap.exists()) {
                             toast({ variant: 'destructive', title: 'Erreur', description: 'Profil utilisateur non trouvé.' });
                             return;
                        }
                        const currentUserProfile = currentUserSnap.data() as UserProfile;

                        const newConversationData = {
                            participantIds: [user.uid, recipientId],
                            participants: {
                                [user.uid]: {
                                    username: currentUserProfile.username,
                                    profilePicture: currentUserProfile.profilePicture,
                                },
                                [recipientId]: {
                                    username: recipientProfile.username,
                                    profilePicture: recipientProfile.profilePicture,
                                }
                            },
                            createdAt: serverTimestamp(),
                            updatedAt: serverTimestamp(),
                        };

                        const newConversationRef = await addDoc(collection(firestore, 'conversations'), newConversationData)
                            .catch(serverError => {
                                const permissionError = new FirestorePermissionError({
                                    path: 'conversations',
                                    operation: 'create',
                                    requestResourceData: newConversationData,
                                });
                                errorEmitter.emit('permission-error', permissionError);
                                throw permissionError;
                            });
                        
                        setSelectedConversation({
                            id: newConversationRef.id,
                            ...newConversationData,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        } as Conversation);
                    } catch (error) {
                        if (!(error instanceof FirestorePermissionError)) {
                           console.error("Error creating or fetching user for conversation:", error);
                           toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de démarrer la conversation." });
                        }
                    }
                }
            };
            findAndSetConversation();
        } else if (!recipientId && conversations && conversations.length > 0 && !selectedConversation) {
            // Select the most recent conversation if none is selected
            const sortedConversations = [...conversations].sort((a, b) => {
                const dateA = getSafeDate(a.updatedAt)?.getTime() || 0;
                const dateB = getSafeDate(b.updatedAt)?.getTime() || 0;
                return dateB - dateA;
            });
            setSelectedConversation(sortedConversations[0]);
        }

    }, [user, isUserLoading, router, searchParams, firestore, conversations, selectedConversation, toast]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (isUserLoading || !user) {
        return <PageSkeleton />;
    }

    const handleDeleteConversation = async (conversationId: string) => {
        if (!firestore) return;
        try {
            await deleteConversation(conversationId);
            toast({
                title: "Conversation supprimée",
                description: "La conversation a été définitivement supprimée.",
            });
            if (selectedConversation?.id === conversationId) {
                setSelectedConversation(null);
            }
        } catch (error) {
             console.error('Failed to delete conversation', error);
             toast({
                title: "Erreur",
                description: "Impossible de supprimer la conversation.",
                variant: 'destructive',
             });
        }
    };

    const handleDeleteMessage = async (message: ChatMessage) => {
        if (!firestore || !selectedConversation || message.senderId !== user?.uid) return;

        const conversationRef = doc(firestore, 'conversations', selectedConversation.id);
        
        try {
            await updateDoc(conversationRef, {
                messages: arrayRemove(message)
            });
            // Note: This relies on finding the exact message object in the array, which works for this implementation.
            toast({
                title: 'Message supprimé',
            });
        } catch (error) {
            const permissionError = new FirestorePermissionError({
                path: `conversations/${selectedConversation.id}`,
                operation: 'update',
                requestResourceData: { messages: arrayRemove(message) }
            });
            errorEmitter.emit('permission-error', permissionError);
            console.error("Error deleting message: ", error);
        }
    };


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if(newMessage.trim() === '' || !firestore || !selectedConversation) return;

        const messagesColRef = collection(firestore, 'conversations', selectedConversation.id, 'messages');
        const conversationDocRef = doc(firestore, 'conversations', selectedConversation.id);

        const messageData = {
            id: doc(messagesColRef).id,
            text: newMessage,
            senderId: user.uid,
            createdAt: serverTimestamp()
        };

        // Use non-blocking addDoc for messages
        addDocumentNonBlocking(doc(messagesColRef, messageData.id), messageData, {});
        
        // Non-blocking update for conversation metadata
        updateDoc(conversationDocRef, {
            lastMessage: {
                text: newMessage,
                senderId: user.uid,
                timestamp: serverTimestamp()
            },
            updatedAt: serverTimestamp()
        }).catch(error => {
             const permissionError = new FirestorePermissionError({
                path: `conversations/${selectedConversation.id}`,
                operation: 'update',
                requestResourceData: { lastMessage: messageData }
            });
            errorEmitter.emit('permission-error', permissionError);
        });

        setNewMessage('');
    }

    const getOtherParticipant = (conv: Conversation) => {
        const otherId = conv.participantIds.find(id => id !== user.uid);
        return otherId ? { ...conv.participants[otherId], id: otherId } : null;
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
        <div className="container mx-auto my-8">
            <Card className="h-[calc(100vh-200px)] flex">
                {/* Conversations List */}
                <div className="w-1/3 border-r flex flex-col">
                    <div className="p-4 border-b flex-shrink-0">
                        <h2 className="text-xl font-bold">Messages</h2>
                    </div>
                    {conversationsLoading ? <ConversationListSkeleton /> : (
                        <div className="divide-y flex-grow overflow-y-auto">
                            {conversations && conversations.map(conv => {
                                const otherUser = getOtherParticipant(conv);
                                const lastMessageDate = getSafeDate(conv.lastMessage?.timestamp);
                                const lastMessageTime = lastMessageDate ? formatDistanceToNow(lastMessageDate, { addSuffix: true, locale: fr }) : '';


                                return (
                                    <div 
                                        key={conv.id} 
                                        className={`p-4 cursor-pointer hover:bg-muted/50 group relative ${selectedConversation?.id === conv.id ? 'bg-muted' : ''}`}
                                        onClick={() => setSelectedConversation(conv)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Link href={otherUser ? `/profile/${otherUser.id}` : '#'} onClick={(e) => e.stopPropagation()}>
                                                <Avatar>
                                                    <AvatarImage src={otherUser?.profilePicture} />
                                                    <AvatarFallback>{getInitials(otherUser?.username)}</AvatarFallback>
                                                </Avatar>
                                            </Link>
                                            <div className="flex-grow overflow-hidden">
                                                <div className="flex justify-between items-baseline">
                                                     <Link href={otherUser ? `/profile/${otherUser.id}` : '#'} onClick={(e) => e.stopPropagation()} className="font-semibold truncate hover:underline">
                                                        <p>{otherUser?.username}</p>
                                                     </Link>
                                                    <p className="text-xs text-muted-foreground flex-shrink-0">{lastMessageTime}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">{conv.lastMessage?.text}</p>
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Supprimer la conversation ?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Cette action est irréversible. L'historique des messages sera définitivement perdu.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteConversation(conv.id)} className="bg-destructive hover:bg-destructive/90">
                                                            Supprimer
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                )
                            })}
                            {!conversationsLoading && conversations?.length === 0 && (
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
                            <div className="p-4 border-b flex items-center gap-3 flex-shrink-0">
                                <Link href={`/profile/${getOtherParticipant(selectedConversation)?.id || ''}`}>
                                    <Avatar>
                                        <AvatarImage src={getOtherParticipant(selectedConversation)?.profilePicture} />
                                        <AvatarFallback>{getInitials(getOtherParticipant(selectedConversation)?.username)}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                 <Link href={`/profile/${getOtherParticipant(selectedConversation)?.id || ''}`} className="font-semibold hover:underline">
                                    <h3>{getOtherParticipant(selectedConversation)?.username}</h3>
                                </Link>
                            </div>
                            <div className="flex-grow p-4 space-y-1 overflow-y-auto">
                                {messagesLoading && <div className="text-center text-muted-foreground">Chargement des messages...</div>}
                                {!messagesLoading && messages?.map((msg, index) => {
                                    const msgDate = getSafeDate(msg.createdAt);
                                    const msgTime = msgDate ? msgDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
                                    const isSender = msg.senderId === user.uid;

                                    return (
                                        <div key={msg.id || index} className={`group flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                                            {isSender && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onClick={() => handleDeleteMessage(msg)} className="text-destructive">
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                            <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${isSender ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                <p>{msg.text}</p>
                                                <p className="text-xs text-right mt-1 opacity-70">{msgTime}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t bg-background flex-shrink-0">
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
        </div>
    );
}
