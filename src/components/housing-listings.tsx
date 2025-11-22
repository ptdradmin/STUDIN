
"use client";

import type { Housing, UserProfile } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import HousingCard from './housing-card';
import { Skeleton } from './ui/skeleton';

interface HousingListingsProps {
    housings: Housing[];
    profiles: Record<string, UserProfile>;
    isLoading: boolean;
    onEdit: (housing: Housing) => void;
}

export default function HousingListings({ housings, profiles, isLoading, onEdit }: HousingListingsProps) {
  
  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between items-center pt-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-10 w-24" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
  }

  return (
    <div>
        {housings.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {housings.map(housing => (
                    <HousingCard key={housing.id} housing={housing} owner={profiles[housing.userId]} onEdit={onEdit} />
                ))}
            </div>
        ) : (
            <Card className="text-center py-20">
                <CardContent>
                    <h3 className="text-xl font-semibold">Aucun logement ne correspond à votre recherche</h3>
                    <p className="text-muted-foreground mt-2">Essayez d'élargir vos critères de recherche.</p>
                </CardContent>
            </Card>
        )}
    </div>
  );
}

    