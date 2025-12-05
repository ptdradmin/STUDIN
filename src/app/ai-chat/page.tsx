'use client';

import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles, Mic, StopCircle, Trash2 } from "lucide-react";
import SocialSidebar from "@/components/social-sidebar";
import { FormEvent, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { askStudinAi } from "@/ai/flows/studin-ai-flow";
import { cn } from "@/lib/utils";
import Markdown from 'react-markdown';
import { useToast } from "@/hooks/use-toast";


type AiChatMessage = {
    id: number;
    sender: 'user' | 'ai';
    text?: string;
    audioUrl?: string;
};

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
                    <p className="text-xs text-muted-foreground">Assistant IA</p>
                </div>
            </div>
        </div>
    )
}

function MessageBubble({ message }: { message: AiChatMessage }) {
    const { user } = useUser();
    const isUserMessage = message.sender === 'user';
    const audioRef = useRef<HTMLAudioElement>(null);

    const getInitials = (name?: string | null) => {
        if (!name) return '..';
        return name.substring(0, 2).toUpperCase();
    }
    
    useEffect(() => {
        // Autoplay AI audio responses
        if (message.sender === 'ai' && message.audioUrl && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio autoplay failed:", e));
        }
    }, [message]);

    return (
        <div className={cn("flex items-start gap-3", isUserMessage && "justify-end")}>
             {!isUserMessage && (
                <Avatar className="h-8 w-8">
                     <div className="h-full w-full flex items-center justify-center rounded-full bg-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                </Avatar>
            )}
            <div className={cn("max-w-md p-3 rounded-2xl", isUserMessage ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                {message.text && <div className="prose prose-sm dark:prose-invert prose-p:my-0"><Markdown>{message.text}</Markdown></div>}
                {message.audioUrl && (
                    <audio ref={audioRef} src={message.audioUrl} controls className={cn("w-full h-10", message.text && "mt-2")} />
                )}
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
    const [messages, setMessages] = useState<AiChatMessage[]>([
        { id: 0, sender: 'ai', text: "Bonjour ! Je suis STUD'IN AI, votre assistant personnel alimenté par Gemini 2.5 Pro. Comment puis-je vous aider ? Vous pouvez m'écrire ou m'envoyer un message vocal." }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);


     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && audioChunksRef.current.length === 0) || isLoading) return;

        const userMessage: AiChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: newMessage.trim() || undefined,
        };

        let audioBlob: Blob | null = null;
        if (audioChunksRef.current.length > 0) {
            audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            userMessage.audioUrl = URL.createObjectURL(audioBlob);
            audioChunksRef.current = [];
        }
        
        setMessages(prev => [...prev, userMessage]);
        const currentMessage = newMessage;
        setNewMessage('');
        setIsLoading(true);
        
        try {
            let audioDataUri: string | undefined = undefined;
            if (audioBlob) {
                audioDataUri = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(audioBlob!);
                });
            }
            
            const result = await askStudinAi({ text: currentMessage, audio: audioDataUri });
            const aiResponse: AiChatMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: result.text,
                audioUrl: result.audio
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("Error asking STUD'IN AI:", error);
            const errorResponse: AiChatMessage = {
                id: Date.now() + 1,
                sender: 'ai',
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
            mediaRecorderRef.current.stop();
            if(cancel) {
                audioChunksRef.current = [];
            } else {
                 // Automatically submit the form when recording stops
                 handleSendMessage(new Event('submit') as any);
            }
            setIsRecording(false);
            if(recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
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
                        <MessageBubble key={msg.id} message={msg} />
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
                    {isRecording ? (
                         <div className="flex items-center gap-2 h-10">
                             <Button type="button" variant="ghost" size="icon" onClick={() => stopRecording(true)}>
                                <Trash2 className="h-5 w-5 text-muted-foreground" />
                            </Button>
                            <div className="flex-grow text-center flex items-center justify-center gap-2">
                               <div className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="font-mono text-sm">{formatRecordingTime(recordingTime)}</span>
                            </div>
                            <Button type="button" variant="destructive" size="icon" onClick={() => stopRecording()}>
                                <StopCircle className="h-5 w-5" />
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <Input 
                                placeholder="Discutez avec STUD'IN AI..."
                                className="flex-grow" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isLoading}
                            />
                             {newMessage.trim() === '' ? (
                                 <Button type="button" variant="ghost" size="icon" onClick={startRecording} disabled={isLoading}>
                                     <Mic className="h-5 w-5"/>
                                 </Button>
                             ) : (
                                 <Button type="submit" size="icon" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
