
"use client";

import { useState, useTransition } from 'react';
import type { Housing } from '@/lib/mock-data';
import { getHousings } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import HousingCard from './housing-card';
import { Skeleton } from './ui/skeleton';

interface HousingListingsProps {
    initialHousings: Housing[];
}

export default function HousingListings({ initialHousings }: HousingListingsProps) {
  const [housings, setHousings] = useState<Housing[]>(initialHousings);
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState({
    city: '',
    type: '',
    min_price: '',
    max_price: ''
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleTypeChange = (value: string) => {
    setFilters({
      ...filters,
      type: value === 'all' ? '' : value,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
        const data = await getHousings(filters);
        setHousings(data);
    });
  };

  return (
    <div>
        <Card className="mb-8 shadow-md">
            <CardContent className="p-6">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ville</label>
                        <Input name="city" placeholder="Ex: Namur, Liège..." value={filters.city} onChange={handleFilterChange} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                         <Select value={filters.type || 'all'} onValueChange={handleTypeChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tous" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="kot">Kot</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                                <SelectItem value="colocation">Colocation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">Prix min (€)</label>
                        <Input name="min_price" type="number" placeholder="0" value={filters.min_price} onChange={handleFilterChange} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Prix max (€)</label>
                        <Input name="max_price" type="number" placeholder="1000" value={filters.max_price} onChange={handleFilterChange} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? 'Recherche...' : '🔍 Rechercher'}
                    </Button>
                </form>
            </CardContent>
        </Card>

        {isPending ? (
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
        ) : (
            <>
                {housings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {housings.map(housing => (
                            <HousingCard key={housing.id} housing={housing} />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-20">
                        <CardContent>
                            <h3 className="text-xl font-semibold">Aucun logement trouvé</h3>
                            <p className="text-muted-foreground mt-2">Essayez d'ajuster vos filtres de recherche.</p>
                        </CardContent>
                    </Card>
                )}
            </>
        )}
    </div>
  );
}
