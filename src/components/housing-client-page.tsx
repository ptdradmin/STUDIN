
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import HousingListings from '@/components/housing-listings';
import { LayoutGrid, Map, Plus } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import dynamic from 'next/dynamic';
import { useCollection } from '@/firebase';
import type { Housing } from '@/lib/types';
import CreateHousingForm from './create-housing-form';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse" />,
});

export default function HousingClientPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const { data: housings, loading } = useCollection<Housing>('housings');
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une annonce
        </Button>
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
      
      {showCreateForm && <CreateHousingForm onClose={() => setShowCreateForm(false)} />}

      {viewMode === 'grid' && (
        <HousingListings initialHousings={housings || []} isLoading={loading} />
      )}
      {viewMode === 'map' && (
        <Card>
          <CardContent className="p-2">
            <div className="h-[600px] w-full rounded-md overflow-hidden">
              <MapView items={housings || []} itemType="housing" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
