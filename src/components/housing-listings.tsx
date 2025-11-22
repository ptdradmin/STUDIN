
"use client";

import type { Housing } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import HousingCard from './housing-card';
import { Skeleton } from './ui/skeleton';

interface HousingListingsProps {
    initialHousings: Housing[];
    isLoading: boolean;
    onEdit: (housing: Housing) => void;
}

export default function HousingListings({ initialHousings, isLoading, onEdit }: HousingListingsProps) {
  
  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
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
        {initialHousings.length > 0 ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {initialHousings.map(housing => (
                    <HousingCard key={housing.id} housing={housing} onEdit={onEdit} />
                ))}
            </div>
        ) : (
            <Card className="text-center py-20">
                <CardContent>
                    <h3 className="text-xl font-semibold">Aucun logement trouvé</h3>
                    <p className="text-muted-foreground mt-2">Soyez le premier à ajouter une annonce !</p>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
