
'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for now
const conversations = [
    { id: '1', name: 'Gui Doba', lastMessage: 'Salut! Le kot est toujours dispo ?', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=gui' },
    { id: '2', name: 'Jane Doe', lastMessage: 'Ok, merci pour l\'info !', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=jane' },
];

const messages = {
    '1': [
        { sender: 'other', text: 'Salut! Le kot est toujours dispo ?', time: '10:00' },
        { sender: 'me', text: 'Bonjour, oui il est disponible !', time: '10:01' },
    ],
    '2': [
         { sender: 'other', text: 'Ok, merci pour l\'info !', time: '11:30' },
    ]
}


export default function MessagesPage() {
    const { user, loading } = useUser();
    const router = useRouter();
    const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?from=/messages');
        }
    }, [user, loading, router]);
    
    if (loading || !user) {
        return (
             <div className="flex flex-col min-h-screen">
                <Navbar />
                <div className="flex-grow container mx-auto p-4">
                    <Skeleton className="h-[80vh] w-full" />
                </div>
                <Footer />
            </div>
        )
    }

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(newMessage.trim() === '') return;
        console.log("Sending message:", newMessage);
        setNewMessage('');
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
                        <div className="divide-y">
                            {conversations.map(conv => (
                                <div 
                                    key={conv.id} 
                                    className={`p-4 cursor-pointer hover:bg-muted/50 ${selectedConversation.id === conv.id ? 'bg-muted' : ''}`}
                                    onClick={() => setSelectedConversation(conv)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={conv.avatar} />
                                            <AvatarFallback>{conv.name.substring(0, 2)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{conv.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="w-2/3 flex flex-col">
                        {selectedConversation ? (
                            <>
                                <div className="p-4 border-b flex items-center gap-3">
                                     <Avatar>
                                        <AvatarImage src={selectedConversation.avatar} />
                                        <AvatarFallback>{selectedConversation.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <h3 className="font-semibold">{selectedConversation.name}</h3>
                                </div>
                                <CardContent className="flex-grow p-4 space-y-4 overflow-y-auto">
                                    {(messages as any)[selectedConversation.id].map((msg: any, index: number) => (
                                         <div key={index} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                <p>{msg.text}</p>
                                                <p className="text-xs text-right mt-1 opacity-70">{msg.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                                <div className="p-4 border-t bg-background">
                                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                        <Input 
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Écrivez votre message..." 
                                            className="flex-grow"
                                        />
                                        <Button type="submit" size="icon">
                                            <Send className="h-5 w-5" />
                                        </Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex-grow flex items-center justify-center">
                                <p className="text-muted-foreground">Sélectionnez une conversation pour commencer</p>
                            </div>
                        )}
                    </div>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
