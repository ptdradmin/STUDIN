
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import HousingListings from '@/components/housing-listings';
import { LayoutGrid, Map, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import dynamic from 'next/dynamic';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import type { Housing, UserProfile } from '@/lib/types';
import CreateHousingForm from './create-housing-form';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse" />,
});

export default function HousingClientPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const firestore = useFirestore();
  const { user } = useUser();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHousing, setEditingHousing] = useState<Housing | null>(null);

  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState(1000);

  const housingsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'housings');
  }, [firestore]);

  const { data: housings, isLoading: housingsLoading } = useCollection<Housing>(housingsCollection);

  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [profilesLoading, setProfilesLoading] = useState(true);

  useEffect(() => {
    if (!housings || !firestore) return;

    const fetchUserProfiles = async () => {
        setProfilesLoading(true);
        const ownerIds = [...new Set(housings.map(h => h.userId))];
        if (ownerIds.length === 0) {
            setProfilesLoading(false);
            return;
        }

        const newProfiles: Record<string, UserProfile> = {};
        const chunks = [];
        for (let i = 0; i < ownerIds.length; i += 30) {
            chunks.push(ownerIds.slice(i, i + 30));
        }
        
        for (const chunk of chunks) {
            if (chunk.length > 0) {
                const usersQuery = query(collection(firestore, 'users'), where('id', 'in', chunk));
                const usersSnapshot = await getDocs(usersQuery);
                usersSnapshot.forEach(doc => {
                    newProfiles[doc.id] = doc.data() as UserProfile;
                });
            }
        }
        
        setUserProfiles(prev => ({...prev, ...newProfiles}));
        setProfilesLoading(false);
    };

    fetchUserProfiles();
  }, [housings, firestore]);

  const filteredHousings = useMemo(() => {
    if (!housings) return [];
    return housings.filter(housing => {
      const cityMatch = cityFilter ? housing.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
      const typeMatch = typeFilter && typeFilter !== 'all' ? housing.type === typeFilter : true;
      const priceMatch = housing.price <= priceFilter;
      return cityMatch && typeMatch && priceMatch;
    });
  }, [housings, cityFilter, typeFilter, priceFilter]);

  const handleEdit = (housing: Housing) => {
    setEditingHousing(housing);
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingHousing(null);
  };

  const handleCreateClick = () => {
    setEditingHousing(null);
    setShowCreateForm(true);
  }

  const isLoading = housingsLoading || profilesLoading;

  return (
    <div>
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Filtrer les logements</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end" onSubmit={e => e.preventDefault()}>
                    <div className="space-y-2">
                        <Label htmlFor="city">Ville</Label>
                        <Input id="city" placeholder="Ex: Namur" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type de logement</Label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger><SelectValue placeholder="Tous types" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous types</SelectItem>
                                <SelectItem value="kot">Kot</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                                <SelectItem value="colocation">Colocation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="price">Prix maximum: {priceFilter}€</Label>
                         <Input id="price" type="range" min="100" max="1000" step="25" value={priceFilter} onChange={e => setPriceFilter(Number(e.target.value))} />
                    </div>
                </form>
            </CardContent>
        </Card>

      <div className="flex justify-between items-center mb-4">
        {user && (
          <Button onClick={handleCreateClick}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter une annonce
          </Button>
        )}
        <div className="flex items-center gap-1 rounded-md bg-muted p-1 ml-auto">
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
      
      {showCreateForm && <CreateHousingForm onClose={handleCloseForm} housingToEdit={editingHousing} />}

      {viewMode === 'grid' && (
        <HousingListings 
            housings={filteredHousings} 
            profiles={userProfiles}
            isLoading={isLoading} 
            onEdit={handleEdit} 
        />
      )}
      {viewMode === 'map' && (
        <Card>
          <CardContent className="p-2">
            <div className="h-[600px] w-full rounded-md overflow-hidden">
              <MapView items={filteredHousings} itemType="housing" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

    