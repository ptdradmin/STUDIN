
'use client';

import { PageSkeleton } from '@/components/page-skeleton';
import { Film } from 'lucide-react';

export default function ReelsPage() {

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-center">
                 <div className="w-full max-w-md text-center py-20">
                     <Film className="h-16 w-16 mx-auto text-muted-foreground" strokeWidth={1} />
                     <h1 className="text-2xl font-bold mt-4">Reels</h1>
                     <p className="text-muted-foreground mt-2">
                         Cette fonctionnalité est en cours de développement. Revenez bientôt pour découvrir des vidéos courtes et amusantes !
                     </p>
                 </div>
            </div>
        </div>
    );
}
