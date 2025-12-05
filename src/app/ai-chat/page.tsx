'use client';

import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import SocialSidebar from "@/components/social-sidebar";
import { FormEvent, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { askStudinAi } from "@/ai/flows/studin-ai-flow";
import { cn } from "@/lib/utils";
import Markdown from 'react-markdown';


type AiChatMessage = {
    id: number;
    sender: 'user' | 'ai';
    text: string;
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

    const getInitials = (name?: string | null) => {
        if (!name) return '..';
        return name.substring(0, 2).toUpperCase();
    }

    return (
        <div className={cn("flex items-start gap-3", isUserMessage && "justify-end")}>
             {!isUserMessage && (
                <Avatar className="h-8 w-8">
                     <div className="h-full w-full flex items-center justify-center rounded-full bg-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                </Avatar>
            )}
            <div className={cn("max-w-md p-3 rounded-2xl prose prose-sm dark:prose-invert prose-p:my-0", isUserMessage ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <Markdown>{message.text}</Markdown>
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
    const [messages, setMessages] = useState<AiChatMessage[]>([
        { id: 0, sender: 'ai', text: "Bonjour ! Je suis STUD'IN AI. Comment puis-je vous aider aujourd'hui ? Que ce soit pour réviser un cours, trouver une idée de sortie ou organiser votre semaine, je suis là pour vous." }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isLoading) return;

        const userMessage: AiChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: newMessage
        };
        
        setMessages(prev => [...prev, userMessage]);
        const currentMessage = newMessage;
        setNewMessage('');
        setIsLoading(true);
        
        try {
            const result = await askStudinAi({ message: currentMessage });
            const aiResponse: AiChatMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: result.response
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
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Input 
                            placeholder="Discutez avec STUD'IN AI..."
                            className="flex-grow" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isLoading}
                        />
                         <Button type="submit" size="icon" disabled={!newMessage.trim() || isLoading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                             <Send className="h-5 w-5"/>
                         </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
