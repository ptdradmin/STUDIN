
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Sparkles, Mic, StopCircle, Trash2, Paperclip, X, Loader2, Gem } from "lucide-react";
import SocialSidebar from "@/components/social-sidebar";
import { FormEvent, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Markdown from 'react-markdown';
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import type { ChatMessage, UserProfile, Housing as HousingType, Event as EventType, Assignment } from "@/lib/types";
import { doc, collection, addDoc, deleteDoc, Timestamp, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import type { StudinAiInput, StudinAiOutput } from '@/ai/schemas/studin-ai-schema';
import { getInitials } from "@/lib/avatars";
import type { AssignmentForTool } from '@/ai/tools/manage-assignments-tool';
import { Badge } from "@/components/ui/badge";


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
                    <p className="font-semibold">Alice</p>
                    <p className="text-xs text-muted-foreground">Assistante IA Créative</p>
                </div>
            </div>
        </div>
    )
}

function HousingResultCard({ housing }: { housing: any }) {
    return (
        <div className="w-full max-w-xs bg-card p-3 rounded-lg border">
            <div className="relative aspect-video mb-2">
                <Image src={housing.imageUrl} alt={housing.title} fill className="object-cover rounded-md" />
            </div>
            <h3 className="font-bold text-base truncate">{housing.title}</h3>
            <p className="text-sm text-muted-foreground">{housing.city}</p>
            <div className="flex justify-between items-end mt-2">
                <p className="text-lg font-bold text-primary">{housing.price}€</p>
                <Button size="sm" asChild>
                    <Link href={`/housing/${housing.id}`}>Voir</Link>
                </Button>
            </div>
        </div>
    );
}

function EventResultCard({ event }: { event: any }) {
  return (
    <div className="w-full max-w-xs bg-card p-3 rounded-lg border">
      <div className="relative aspect-video mb-2">
        <Image src={event.imageUrl} alt={event.title} fill className="object-cover rounded-md" />
      </div>
      <h3 className="font-bold text-base truncate">{event.title}</h3>
      <p className="text-sm text-muted-foreground">{event.city}</p>
      <div className="flex justify-between items-end mt-2">
        <p className="text-lg font-bold text-primary">{event.price > 0 ? `${event.price}€` : 'Gratuit'}</p>
        <Button size="sm" asChild>
          <Link href={`/events#event-${event.id}`}>Voir</Link>
        </Button>
      </div>
    </div>
  );
}

function AssignmentResultCard({ assignments }: { assignments: AssignmentForTool[] }) {
  return (
    <div className="w-full max-w-xs bg-card p-4 rounded-lg border space-y-3">
        <h3 className="font-bold text-base">Prochaines échéances</h3>
        {assignments.map(item => (
            <div key={item.id} className="text-sm border-t pt-2">
                <div className="flex justify-between">
                    <p className="font-semibold">{item.title}</p>
                    <Badge variant={item.status === 'done' ? 'secondary' : 'default'}>{item.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.subject}</p>
                <p className="text-xs font-medium text-primary mt-1">{item.dueDate}</p>
            </div>
        ))}
    </div>
  );
}

function CheckoutResultCard({ url }: { url: string }) {
    return (
        <div className="w-full max-w-xs bg-card p-4 rounded-lg border space-y-3">
            <h3 className="font-bold text-base">Devenez membre Alice Pro</h3>
            <p className="text-sm text-muted-foreground">
                Cliquez sur le bouton ci-dessous pour finaliser votre abonnement et débloquer toutes les fonctionnalités premium.
            </p>
            <Button asChild className="w-full mt-2">
                <Link href={url}>
                    <Gem className="mr-2 h-4 w-4" /> Passer à Pro
                </Link>
            </Button>
        </div>
    );
}

const MessageBubble = ({ message, onClientAction, isActionLoading }: { message: ChatMessage, onClientAction: (results: any) => void, isActionLoading: boolean }) => {
    const { user } = useUser();
    const isUserMessage = message.role === 'user';
    
    const firestore = useFirestore();

    useEffect(() => {
        const executeClientAction = async () => {
            if (!message.toolData?.clientAction || !firestore || !user) return;
            
            const { type, payload } = message.toolData.clientAction;

            try {
                let resultData: any = null;
                if (type === 'SEARCH_HOUSINGS') {
                    let q = query(collection(firestore, 'housings'), limit(3));
                    if (payload.city) q = query(q, where('city', '==', payload.city));
                    const snapshot = await getDocs(q);
                    resultData = { searchHousingsTool: { results: snapshot.docs.map(d => d.data()) } };
                } else if (type === 'SEARCH_EVENTS') {
                    let q = query(collection(firestore, 'events'), limit(3));
                     if (payload.city) q = query(q, where('city', '==', payload.city));
                    const snapshot = await getDocs(q);
                    resultData = { searchEventsTool: { results: snapshot.docs.map(d => d.data()) } };
                } else if (type === 'MANAGE_ASSIGNMENTS') {
                    const assignmentsCol = collection(firestore, 'users', user.uid, 'assignments');
                    if (payload.action === 'list') {
                        const q = query(assignmentsCol, where('status', '!=', 'done'), orderBy('status'), orderBy('dueDate', 'asc'), limit(10));
                        const snapshot = await getDocs(q);
                        resultData = { manageAssignmentsTool: { results: snapshot.docs.map(d => d.data()) } };
                    } else if (payload.action === 'add' && payload.assignment) {
                        const newDocRef = doc(assignmentsCol);
                        const newAssignment = { ...payload.assignment, id: newDocRef.id, userId: user.uid, createdAt: Timestamp.now(), dueDate: Timestamp.fromDate(new Date(payload.assignment.dueDate)) };
                        setDocumentNonBlocking(newDocRef, newAssignment, {});
                    } else if (payload.action === 'update' && payload.assignment?.id) {
                        const docRef = doc(assignmentsCol, payload.assignment.id);
                        updateDocumentNonBlocking(docRef, { status: payload.assignment.status });
                    } else if (payload.action === 'remove' && payload.assignment?.id) {
                         const docRef = doc(assignmentsCol, payload.assignment.id);
                         deleteDoc(docRef);
                    }
                } else if (type === 'SAVE_PREFERENCE') {
                    const userRef = doc(firestore, 'users', user.uid);
                    updateDocumentNonBlocking(userRef, { [`aiPreferences.${payload.key}`]: payload.value });
                }

                if (resultData) {
                    onClientAction(resultData);
                }
            } catch (error) {
                console.error("Client action failed:", error);
                onClientAction(null); // Notify that action failed
            }
        };

        if (message.toolData?.clientAction) {
            executeClientAction();
        }
    }, [message.toolData, firestore, user, onClientAction]);

    return (
        <div 
            className={cn("flex items-start gap-2 group", isUserMessage && "justify-end")}
        >
            {!isUserMessage && (
                <Avatar className="h-8 w-8">
                     <div className="h-full w-full flex items-center justify-center rounded-full bg-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                </Avatar>
            )}
            <div className={cn("max-w-md p-1 rounded-2xl", isUserMessage ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <div className="p-2 space-y-2">
                    {message.imageUrl && !message.toolData && (
                        <div className="relative aspect-square w-full max-w-sm rounded-lg overflow-hidden">
                           <Image src={message.imageUrl} alt="Generated or uploaded image" fill className="object-cover"/>
                        </div>
                    )}
                    {message.text && <div className="prose prose-sm dark:prose-invert prose-p:my-0 px-2"><Markdown>{message.text}</Markdown></div>}
                    {message.audioUrl && (
                        <audio src={message.audioUrl} controls autoPlay className={cn("w-full h-10", message.text && "mt-2")} />
                    )}
                    
                    {/* These are results of client actions that are displayed in the UI but NOT passed back to the AI */}
                    {message.toolData?.clientAction?.payload.action !== 'list' && message.toolData?.createCheckoutSessionTool?.url && (
                        <div className="flex flex-col gap-2 p-2">
                            <CheckoutResultCard url={message.toolData.createCheckoutSessionTool.url} />
                        </div>
                    )}

                    {isActionLoading && <div className="flex items-center gap-2 p-2"><Loader2 className="h-4 w-4 animate-spin" /> <span className="text-xs text-muted-foreground">Exécution...</span></div>}

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
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: String(Date.now()), role: 'model', senderId: 'alice-ai', createdAt: new Date() as any, text: "Bonjour ! Je suis Alice. Comment puis-je vous aider aujourd'hui ? Vous pouvez me demander de trouver un logement, de générer une image, ou m'envoyer une image ou un message vocal." }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [fileToSend, setFileToSend] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);


    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);
    
    const handleSendMessage = useCallback(async (
      text?: string,
      imageUrl?: string,
      audioUrl?: string,
      toolData?: any
    ) => {
        if (isLoading) return;
        setIsLoading(true);

        const userMessage: ChatMessage = {
            id: String(Date.now()),
            role: 'user',
            senderId: user?.uid || 'user',
            createdAt: new Date() as any,
            text: text || undefined,
            imageUrl: imageUrl,
            audioUrl: audioUrl,
            toolData: toolData,
        };

        const aiResponsePlaceholder: ChatMessage = {
            id: String(Date.now() + 1),
            role: 'model',
            senderId: 'alice-ai',
            createdAt: new Date() as any,
            text: '',
        };

        const currentMessages = toolData ? messages : [...messages, userMessage];
        setMessages([...currentMessages, aiResponsePlaceholder]);

        const historyForAi: StudinAiInput['history'] = currentMessages
            .slice(1) // Remove initial welcome message
            .map(({ role, text, imageUrl, audioUrl, toolData }) => ({
                role, text, imageUrl, audioUrl, toolData
            }));
            
        const messageToSend: StudinAiInput['message'] = { role: 'user' };
        if (userMessage.text) messageToSend.text = userMessage.text;
        if (userMessage.imageUrl) messageToSend.imageUrl = userMessage.imageUrl;
        if (userMessage.audioUrl) messageToSend.audioUrl = userMessage.audioUrl;
        if (userMessage.toolData) messageToSend.toolData = userMessage.toolData;
        
        setNewMessage('');
        setFileToSend(null);
        setPreviewUrl(null);

        try {
            const profileData = userProfile ? {
                id: userProfile.id,
                username: userProfile.username,
                email: userProfile.email,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                university: userProfile.university,
                fieldOfStudy: userProfile.fieldOfStudy,
                city: userProfile.city,
                bio: userProfile.bio,
                isPro: userProfile.isPro,
                aiPreferences: userProfile.aiPreferences,
            } : undefined;

            const response = await fetch('/api/ai', {
                method: 'POST',
                body: JSON.stringify({
                    history: historyForAi,
                    message: messageToSend,
                    isPro: userProfile?.isPro || false,
                    userProfile: profileData,
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let fullResponse: Partial<StudinAiOutput> = {};
            
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                const chunk = decoder.decode(value, { stream: true });
                try {
                    const jsonChunks = chunk.split('\n').filter(c => c.trim());
                    for (const jsonChunk of jsonChunks) {
                         const parsedChunk = JSON.parse(jsonChunk);
                         if (parsedChunk.text) {
                            setMessages(prev => prev.map(msg => 
                                msg.id === aiResponsePlaceholder.id 
                                ? { ...msg, text: (msg.text || '') + parsedChunk.text }
                                : msg
                            ));
                         }
                         if(parsedChunk.audio) fullResponse.audio = parsedChunk.audio;
                         if(parsedChunk.toolData) fullResponse.toolData = parsedChunk.toolData;
                         if(parsedChunk.imageUrl) fullResponse.imageUrl = parsedChunk.imageUrl;
                    }
                } catch (e) {
                    console.warn("Could not parse stream chunk:", chunk, e);
                }
            }
            
            if (fullResponse.toolData) {
                setIsActionLoading(true);
            }

             setMessages(prev => prev.map(msg => 
                msg.id === aiResponsePlaceholder.id 
                ? { ...msg, audioUrl: fullResponse.audio, toolData: fullResponse.toolData, imageUrl: fullResponse.imageUrl }
                : msg
            ));

        } catch (error) {
            console.error("Error asking Alice:", error);
            setMessages(prev => prev.map(msg => 
                msg.id === aiResponsePlaceholder.id 
                ? { ...msg, text: "Désolé, je rencontre un problème pour répondre. Veuillez réessayer plus tard." }
                : msg
            ));
        } finally {
            setIsLoading(false);
        }
    }, [messages, user, userProfile, isLoading]);

    const handleSubmitForm = async (e: FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !fileToSend) || isLoading) return;

        let text = newMessage.trim() || undefined;
        let imageUrl: string | undefined = undefined;
        let audioUrl: string | undefined = undefined;

        if (fileToSend) {
            const fileDataUri = await new Promise<string>(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(fileToSend);
            });
            if (fileToSend.type.startsWith('image/')) {
                imageUrl = fileDataUri;
            } else if (fileToSend.type.startsWith('audio/')) {
                audioUrl = fileDataUri;
            }
        }

        handleSendMessage(text, imageUrl, audioUrl);
    };

    const handleClientAction = useCallback((results: any) => {
        setIsActionLoading(false);
        if (results) {
            // Send the results back to the AI
            handleSendMessage(undefined, undefined, undefined, results);
        }
    }, [handleSendMessage]);
    
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };
            
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
                setFileToSend(audioFile);
                setPreviewUrl(URL.createObjectURL(audioBlob));
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
            setIsRecording(false);
            if(recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            if(cancel) {
                audioChunksRef.current = [];
                setFileToSend(null);
                setPreviewUrl(null);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileToSend(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }
    
    const cancelFile = () => {
        setFileToSend(null);
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
                        <MessageBubble key={msg.id} message={msg} onClientAction={handleClientAction} isActionLoading={isActionLoading} />
                    ))}
                    {isLoading && messages[messages.length-1].text === '' && (
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
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,audio/*"/>
                    {previewUrl && fileToSend && (
                        <div className="mb-2 p-2 border rounded-lg flex items-center justify-between bg-muted/50">
                            <div className="flex items-center gap-2 overflow-hidden">
                                {fileToSend.type.startsWith('image/') ? (
                                    <Image src={previewUrl} alt="Preview" width={40} height={40} className="object-cover rounded-sm" />
                                ) : fileToSend.type.startsWith('audio/') ? (
                                    <audio src={previewUrl} controls className="h-8" />
                                ) : (
                                    <Paperclip className="h-5 w-5 flex-shrink-0"/>
                                )}
                                <span className="text-sm truncate">{fileToSend.name}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelFile}><X className="h-4 w-4" /></Button>
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
                        <form onSubmit={handleSubmitForm} className="flex items-center gap-2">
                             <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isLoading || !!previewUrl}>
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <Input 
                                placeholder="Discutez avec Alice..."
                                className="flex-grow" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isLoading}
                            />
                             {newMessage.trim() === '' && !fileToSend ? (
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
