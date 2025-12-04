

'use client';

import { useFirestore, useUser, useMemoFirebase, useCollection, useDoc, useStorage, errorEmitter, FirestorePermissionError } from "@/firebase";
import type { Conversation, ChatMessage } from "@/lib/types";
import { collection, query, doc, orderBy, serverTimestamp, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Paperclip, X, FileIcon, Image as ImageIcon, Video, Mic, StopCircle, Trash2 } from "lucide-react";
import SocialSidebar from "@/components/social-sidebar";
import { FormEvent, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { createNotification } from "@/lib/actions";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
            <Link href={`/profile/${otherParticipantId}`} className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={otherParticipant?.profilePicture} />
                    <AvatarFallback>{otherParticipant?.username?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <p className="font-semibold">{otherParticipant?.username}</p>
            </Link>
        </div>
    )
}

function MessageBubble({ message, isOwnMessage, onDelete }: { message: ChatMessage, isOwnMessage: boolean, onDelete: (messageId: string) => void }) {
    const [isHovered, setIsHovered] = useState(false);

    const content = () => {
        if (message.imageUrl) {
            return <Image src={message.imageUrl} alt="Image sent in chat" width={300} height={300} className="rounded-lg object-cover" />;
        }
        if (message.videoUrl) {
            return <video src={message.videoUrl} controls className="rounded-lg w-full max-w-xs"></video>;
        }
        if (message.audioUrl) {
            return <audio src={message.audioUrl} controls className="w-full"></audio>;
        }
        return <p className="text-sm">{message.text}</p>;
    }
    
    return (
        <div 
            className={`flex items-end gap-2 group ${isOwnMessage ? 'justify-end' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
             {isOwnMessage && isHovered && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(message.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
            )}
             <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {content()}
             </div>
        </div>
    )
}

export default function ConversationPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const storage = useStorage();
    const params = useParams();
    const { toast } = useToast();
    const conversationId = params.id as string;
    const [newMessage, setNewMessage] = useState('');
    const [fileToSend, setFileToSend] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
    
    // Mark conversation as read when it's opened
    useEffect(() => {
        if (conversationRef && user && conversation?.lastMessage && conversation.lastMessage.senderId !== user.uid) {
             const unread = (conversation as any).unread;
             if (unread) {
                 updateDoc(conversationRef, {
                    unread: false,
                 }).catch(err => {
                    const permissionError = new FirestorePermissionError({
                        path: conversationRef.path,
                        operation: 'update',
                        requestResourceData: { unread: false }
                    });
                    errorEmitter.emit('permission-error', permissionError);
                });
             }
        }
    }, [conversation, conversationRef, user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileToSend(e.target.files[0]);
        }
    }

    const handleDeleteMessage = async (messageId: string) => {
        if (!firestore || !conversationId) return;
        const messageRef = doc(firestore, 'conversations', conversationId, 'messages', messageId);
        try {
            await deleteDoc(messageRef);
            toast({ title: "Message supprimé" });
        } catch (error) {
             const permissionError = new FirestorePermissionError({
                path: messageRef.path,
                operation: 'delete',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    }

    const uploadFileAndSendMessage = async (file: File) => {
        if (!user || !storage || !firestore || !conversationRef || !conversation) return;

        setUploadProgress(0);
        
        const fileType = file.type.split('/')[0] as 'image' | 'video' | 'audio';
        const sRef = storageRef(storage, `chat/${conversationId}/${user.uid}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(sRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload error:", error);
                setUploadProgress(null);
                setFileToSend(null);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
                    const messageDocRef = doc(collection(firestore, 'conversations', conversationId, 'messages'))

                    const messageData: Partial<ChatMessage> = {
                        id: messageDocRef.id,
                        senderId: user.uid,
                        createdAt: serverTimestamp() as any,
                        fileType: fileType,
                    };
                    if (fileType === 'image') messageData.imageUrl = downloadURL;
                    if (fileType === 'video') messageData.videoUrl = downloadURL;
                    if (fileType === 'audio') messageData.audioUrl = downloadURL;
                    
                    const lastMessageText = `A envoyé ${fileType === 'image' ? 'une image' : fileType === 'video' ? 'une vidéo' : 'un audio'}`;

                    setDoc(messageDocRef, messageData)
                        .catch(err => {
                            const permissionError = new FirestorePermissionError({
                                path: messageDocRef.path,
                                operation: 'create',
                                requestResourceData: messageData
                            });
                            errorEmitter.emit('permission-error', permissionError);
                        });

                    const conversationUpdateData = {
                        lastMessage: { text: lastMessageText, senderId: user.uid, timestamp: serverTimestamp() },
                        updatedAt: serverTimestamp(),
                        unread: true,
                    };

                    updateDoc(conversationRef, conversationUpdateData)
                         .catch(err => {
                            const permissionError = new FirestorePermissionError({
                                path: conversationRef.path,
                                operation: 'update',
                                requestResourceData: conversationUpdateData
                            });
                            errorEmitter.emit('permission-error', permissionError);
                        });
                    
                    setFileToSend(null);
                    setUploadProgress(null);
                });
            }
        );
    }

    const handleSendMessage = (e: FormEvent) => {
        e.preventDefault();
        if (fileToSend) {
            uploadFileAndSendMessage(fileToSend);
            return;
        }

        if (!user || !firestore || !conversationRef || !newMessage.trim() || !conversation) return;

        const messagesColRef = collection(firestore, 'conversations', conversationId, 'messages');
        const messageDocRef = doc(messagesColRef);
        
        const messageData: ChatMessage = {
            id: messageDocRef.id,
            senderId: user.uid,
            text: newMessage,
            createdAt: serverTimestamp() as any,
        };

        const otherParticipantId = conversation.participantIds.find(id => id !== user.uid);
        if (!otherParticipantId) return;

        const currentMessage = newMessage;
        setNewMessage('');

        setDoc(messageDocRef, messageData)
            .catch(err => {
                const permissionError = new FirestorePermissionError({
                    path: messageDocRef.path,
                    operation: 'create',
                    requestResourceData: messageData
                });
                errorEmitter.emit('permission-error', permissionError);
            });
            
        const conversationUpdateData = {
            lastMessage: { senderId: user.uid, text: currentMessage, timestamp: serverTimestamp() },
            updatedAt: serverTimestamp(),
            unread: true,
        };

        updateDoc(conversationRef, conversationUpdateData)
            .catch(err => {
                const permissionError = new FirestorePermissionError({
                    path: conversationRef.path,
                    operation: 'update',
                    requestResourceData: conversationUpdateData
                });
                errorEmitter.emit('permission-error', permissionError);
            });

        createNotification(firestore, {
            type: 'new_message',
            senderId: user.uid,
            recipientId: otherParticipantId,
            relatedId: conversationId,
            message: `vous a envoyé un message : "${currentMessage.substring(0, 30)}${currentMessage.length > 30 ? '...' : ''}"`
        });
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
                setFileToSend(audioFile);
                stream.getTracks().forEach(track => track.stop()); // Stop microphone
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            toast({ variant: "destructive", title: "Erreur de micro", description: "Impossible d'accéder au microphone." });
            console.error("Microphone access error:", error);
        }
    };

    const stopRecording = (cancel = false) => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if(cancel) {
                audioChunksRef.current = [];
                setFileToSend(null);
            }
            setIsRecording(false);
            if(recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        }
    };
    
    const getFileIcon = (file: File | null) => {
        if (!file) return <FileIcon />;
        if (file.type.startsWith('image/')) return <ImageIcon />;
        if (file.type.startsWith('video/')) return <Video />;
        if (file.type.startsWith('audio/')) return <Mic />;
        return <FileIcon />;
    }

    const formatRecordingTime = (time: number) => {
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = (time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    const cancelUpload = () => {
        setFileToSend(null);
        setNewMessage('');
    }
    
    const canSend = (!!newMessage.trim() || !!fileToSend) && uploadProgress === null;

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
                        <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === user?.uid} onDelete={handleDeleteMessage} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                 <div className="p-4 border-t bg-card sticky bottom-0">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*"/>
                    {fileToSend && (
                         <div className="mb-2 p-2 border rounded-lg flex items-center justify-between bg-muted/50">
                             <div className="flex items-center gap-2 overflow-hidden">
                                {fileToSend.type.startsWith('audio/') ? (
                                    <audio src={URL.createObjectURL(fileToSend)} controls className="h-10" />
                                ) : fileToSend.type.startsWith('image/') ? (
                                    <Image src={URL.createObjectURL(fileToSend)} alt="Preview" width={40} height={40} className="rounded-md object-cover" />
                                ) : (
                                    getFileIcon(fileToSend)
                                )}
                                <span className="text-sm truncate">{fileToSend.name}</span>
                            </div>
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelUpload}><X className="h-4 w-4" /></Button>
                         </div>
                    )}
                    {uploadProgress !== null && <Progress value={uploadProgress} className="mb-2 h-1" />}
                    
                    {isRecording ? (
                         <div className="flex items-center gap-2 h-10">
                            <Button type="button" variant="destructive" size="icon" onClick={() => stopRecording()}>
                                <StopCircle className="h-5 w-5" />
                            </Button>
                            <div className="flex-grow text-center flex items-center justify-center gap-2">
                               <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="font-mono text-sm">{formatRecordingTime(recordingTime)}</span>
                            </div>
                             <Button type="button" variant="ghost" size="icon" onClick={() => stopRecording(true)}>
                                <Trash2 className="h-5 w-5 text-muted-foreground" />
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={!!fileToSend}>
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <Input 
                                placeholder={fileToSend ? "Prêt à envoyer le fichier..." : "Écrivez votre message..."}
                                className="flex-grow" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isConversationLoading || !!fileToSend}
                            />
                             {newMessage.trim() === '' && !fileToSend ? (
                                 <Button type="button" variant="ghost" size="icon" onClick={startRecording}>
                                     <Mic className="h-5 w-5"/>
                                 </Button>
                             ) : (
                                 <Button type="submit" size="icon" disabled={!canSend} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                     <Send className="h-5 w-5"/>
                                 </Button>
                             )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
