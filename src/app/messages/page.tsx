
'use client';

import SocialSidebar from "@/components/social-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

function ConversationListPlaceholder() {
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


export default function MessagesPage() {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[350px_1fr]">
                <aside className="border-r flex flex-col h-screen">
                    <div className="p-4 border-b">
                         <h1 className="text-2xl font-bold">Messages</h1>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        <ConversationListPlaceholder />
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
