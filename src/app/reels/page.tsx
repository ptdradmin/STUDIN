
'use client';

import { Film } from "lucide-react";

export default function ReelsPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-background">
            <Film className="h-24 w-24 text-muted-foreground" strokeWidth={1} />
            <h1 className="text-2xl font-bold mt-4">Reels</h1>
            <p className="text-muted-foreground mt-2">
                Cette fonctionnalité est en cours de développement.
            </p>
        </div>
    );
}
