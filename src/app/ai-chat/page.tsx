
'use client';

import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles, Mic, StopCircle, Trash2, Paperclip, X, Image as ImageIcon, Loader2 } from "lucide-react";
import SocialSidebar from "@/components/social-sidebar";
import { FormEvent, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { askStudinAi, type StudinAiInput } from "@/ai/flows/studin-ai-flow";
import { cn } from "@/lib/utils";
import Markdown from 'react-markdown';
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import type { ChatMessage } from "@/lib/types";


function MessagesHeader() {
    const router = useRouter();

    return (
        <div className="p-4 border-b flex items-center gap-3 bg-card sticky top-0 z-10">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push('/messages')}>
                <ArrowLeft />
            </Button>
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/50">
                    <div className="h-full w-full flex items-center justify-center bg-primary/20">
                        <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                </Avatar>
                <div>
                    <p className="font-semibold">STUD'IN AI</p>
                    <p className="text-xs text-muted-foreground">Assistant IA Créatif</p>
                </div>
            </div>
        </div>
    )
}

function MessageBubble({ message, onDelete }: { message: ChatMessage, onDelete?: (id: string) => void }) {
    const { user } = useUser();
    const isUserMessage = message.role === 'user';
    const [isHovered, setIsHovered] = useState(false);

    const getInitials = (name?: string | null) => {
        if (!name) return '..';
        return name.substring(0, 2).toUpperCase();
    }
    
    return (
        <div 
            className={cn("flex items-start gap-2 group", isUserMessage && "justify-end")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
             {isUserMessage && onDelete && (
                <Button variant="ghost" size="icon" className={cn("h-7 w-7 transition-opacity", isHovered ? 'opacity-100' : 'opacity-0')} onClick={() => onDelete(message.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
            )}
            {!isUserMessage && (
                <Avatar className="h-8 w-8">
                     <div className="h-full w-full flex items-center justify-center rounded-full bg-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                </Avatar>
            )}
            <div className={cn("max-w-md p-1 rounded-2xl", isUserMessage ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <div className="p-2 space-y-2">
                    {message.imageUrl && (
                        <div className="relative aspect-square w-full max-w-sm rounded-lg overflow-hidden">
                           <Image src={message.imageUrl} alt="Generated or uploaded image" fill className="object-cover"/>
                        </div>
                    )}
                    {message.text && <div className="prose prose-sm dark:prose-invert prose-p:my-0 px-2"><Markdown>{message.text}</Markdown></div>}
                    {message.audioUrl && (
                        <audio src={message.audioUrl} controls className={cn("w-full h-10", message.text && "mt-2")} />
                    )}
                </div>
            </div>
             {isUserMessage && user && (
                 <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL ?? undefined} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}

export default function AiChatPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: String(Date.now()), role: 'model', senderId: 'studin-ai', createdAt: new Date() as any, text: "Bonjour ! Je suis STUD'IN AI. Comment puis-je vous aider aujourd'hui ? Envoyez-moi un message vocal, une image, ou demandez-moi d'en créer une !" }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && audioChunksRef.current.length === 0 && !imageFile) || isLoading) return;

        const userMessage: ChatMessage = {
            id: String(Date.now()),
            role: 'user',
            senderId: 'user',
            createdAt: new Date() as any,
            text: newMessage.trim() || undefined,
            imageUrl: previewUrl || undefined,
        };
        
        let audioBlob: Blob | null = null;
        if (audioChunksRef.current.length > 0) {
            audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            userMessage.audioUrl = URL.createObjectURL(audioBlob);
        }
        
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        
        const currentMessageText = newMessage;
        const currentPreviewUrl = previewUrl;

        setNewMessage('');
        setIsLoading(true);
        setImageFile(null);
        setPreviewUrl(null);
        audioChunksRef.current = [];
        
        try {
            let audioDataUri: string | undefined = undefined;
            if (audioBlob) {
                audioDataUri = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(audioBlob!);
                });
            }
            
            const historyForAi: StudinAiInput['history'] = updatedMessages
                .slice(0, -1)
                .map(({id, senderId, createdAt, ...rest}) => ({role: rest.role, text: rest.text || '', imageUrl: rest.imageUrl, audioUrl: rest.audioUrl}));

            const messageToSend: StudinAiInput['message'] = { role: 'user', text: currentMessageText, imageUrl: currentPreviewUrl, audioUrl: audioDataUri };

            const result = await askStudinAi({ 
                history: historyForAi,
                message: messageToSend
             });
             
            const aiResponse: ChatMessage = {
                id: String(Date.now() + 1),
                role: 'model',
                senderId: 'studin-ai',
                createdAt: new Date() as any,
                text: result.text,
                audioUrl: result.audio,
                imageUrl: result.imageUrl,
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("Error asking STUD'IN AI:", error);
            const errorResponse: ChatMessage = {
                id: String(Date.now() + 1),
                role: 'model',
                senderId: 'studin-ai',
                createdAt: new Date() as any,
                text: "Désolé, je rencontre un problème pour répondre. Veuillez réessayer plus tard."
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    }
    
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };
            
            mediaRecorderRef.current.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                 handleSendMessage(new Event('submit') as any);
            }

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
            mediaRecorderRef.current.onstop = () => {
                 const stream = mediaRecorderRef.current?.stream;
                 stream?.getTracks().forEach(track => track.stop());
                 if (!cancel) {
                    handleSendMessage(new Event('submit') as any);
                 }
            }
            mediaRecorderRef.current.stop();
            if(cancel) {
                audioChunksRef.current = [];
            }
            setIsRecording(false);
            if(recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        }
    };
    
    const deleteMessage = (id: string) => {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== id));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }
    
    const cancelImage = () => {
        setImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const formatRecordingTime = (time: number) => {
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = (time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    };

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex-1 flex flex-col h-screen">
                <MessagesHeader />

                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map(msg => (
                        <MessageBubble key={msg.id} message={msg} onDelete={msg.role === 'user' ? deleteMessage : undefined}/>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                                <div className="h-full w-full flex items-center justify-center rounded-full bg-primary/20">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                            </Avatar>
                             <div className="max-w-md p-3 rounded-2xl bg-muted">
                               <div className="flex items-center gap-2">
                                 <div className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                 <div className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                 <div className="h-2 w-2 bg-foreground rounded-full animate-bounce"></div>
                               </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                 <div className="p-4 border-t bg-card sticky bottom-0">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                    {previewUrl && (
                        <div className="mb-2 p-2 border rounded-lg flex items-center justify-between bg-muted/50">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <ImageIcon className="h-5 w-5 flex-shrink-0"/>
                                <span className="text-sm truncate">{imageFile?.name || 'Image sélectionnée'}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelImage}><X className="h-4 w-4" /></Button>
                        </div>
                    )}
                    {isRecording ? (
                         <div className="flex items-center gap-2 h-10">
                             <Button type="button" variant="ghost" size="icon" onClick={() => stopRecording(true)}>
                                <Trash2 className="h-5 w-5 text-muted-foreground" />
                            </Button>
                            <div className="flex-grow text-center flex items-center justify-center gap-2">
                               <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="font-mono text-sm">{formatRecordingTime(recordingTime)}</span>
                            </div>
                            <Button type="button" variant="destructive" size="icon" onClick={() => stopRecording(false)}>
                                <StopCircle className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                             <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading || !!previewUrl}>
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <Input 
                                placeholder="Discutez avec STUD'IN AI..."
                                className="flex-grow" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isLoading}
                            />
                             {newMessage.trim() === '' && !imageFile ? (
                                 <Button type="button" variant="ghost" size="icon" onClick={startRecording} disabled={isLoading}>
                                     <Mic className="h-5 w-5"/>
                                 </Button>
                             ) : (
                                 <Button type="submit" size="icon" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                     {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5"/>}
                                 </Button>
                             )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
