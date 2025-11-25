'use client';

import { MessageSquare } from "lucide-react";
import SocialSidebar from "@/components/social-sidebar";

export default function MessagesPage() {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageSquare className="h-24 w-24 text-muted-foreground" strokeWidth={1} />
                <h1 className="text-2xl font-bold mt-4">Messagerie</h1>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Cette fonctionnalité est en cours de développement. Bientôt, vous pourrez discuter avec d'autres étudiants.
                </p>
            </div>
        </div>
    );
}
