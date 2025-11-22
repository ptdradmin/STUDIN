
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import HousingListings from '@/components/housing-listings';
import { Housing } from '@/lib/mock-data';
import { LayoutGrid, Map } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
});

interface HousingClientPageProps {
  initialHousings: Housing[];
}

export default function HousingClientPage({
  initialHousings,
}: HousingClientPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-1 rounded-md bg-muted p-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="px-3"
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
          <Button
            variant={viewMode === 'map' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="px-3"
          >
            <Map className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {viewMode === 'grid' && (
        <HousingListings initialHousings={initialHousings} />
      )}
      {viewMode === 'map' && (
        <Card>
          <CardContent className="p-2">
            <div className="h-[600px] w-full rounded-md overflow-hidden">
                <MapView housings={initialHousings} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
