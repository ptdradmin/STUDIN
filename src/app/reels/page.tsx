
'use client';

import { Film } from "lucide-react";
import SocialSidebar from "@/components/social-sidebar";
import { Button } from "@/components/ui/button";

export default function ReelsPage() {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Film className="h-24 w-24 text-muted-foreground" strokeWidth={1} />
                <h1 className="text-2xl font-bold mt-4">Reels</h1>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    Cette fonctionnalité est en cours de développement. Bientôt, vous pourrez partager et découvrir des vidéos courtes.
                </p>
            </div>
        </div>
    );
}
