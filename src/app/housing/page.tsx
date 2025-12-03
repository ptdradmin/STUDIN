
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import HousingListings from '@/components/housing-listings';
import { LayoutGrid, Map, Plus, Search, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import type { Housing, Favorite } from '@/lib/types';
import CreateHousingForm from '@/components/create-housing-form';
import { collection, query, where } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SocialSidebar from '@/components/social-sidebar';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse" />,
});

export default function HousingPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHousing, setEditingHousing] = useState<Housing | null>(null);

  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState(1000);

  const housingsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'housings');
  }, [firestore]);

  const { data: housings, isLoading } = useCollection<Housing>(housingsCollection);

  const favoritesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, `users/${user.uid}/favorites`), where('itemType', '==', 'housing'));
  }, [user, firestore]);
  const { data: favorites } = useCollection<Favorite>(favoritesQuery);
  const favoritedIds = useMemo(() => new Set(favorites?.map(f => f.itemId)), [favorites]);

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
    if (!user) {
        router.push('/login?from=/housing');
        return;
    }
    setEditingHousing(null);
    setShowCreateForm(true);
  }
  
  const handleMarkerClick = (housing: Housing) => {
    router.push(`/housing/${housing.id}`);
  }


  return (
     <div className="flex min-h-screen w-full bg-background">
        <SocialSidebar />
        <div className="flex flex-col flex-1">
            {showCreateForm && <CreateHousingForm onClose={handleCloseForm} housingToEdit={editingHousing} />}

            <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex-1 md:hidden">
                     <Link href="/social" className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-white" />
                          </div>
                      </Link>
                </div>
                <div className="hidden md:flex flex-1 max-w-md items-center">
                    <GlobalSearch />
                </div>
                <div className="flex items-center gap-2 flex-1 justify-end md:justify-normal">
                    <NotificationsDropdown />
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                 <Card className="mb-6">
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
                  <h2 className="text-2xl font-bold tracking-tight">Logements disponibles</h2>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleCreateClick} disabled={isUserLoading}>
                        <Plus className="mr-2 h-4 w-4" /> Ajouter une annonce
                    </Button>
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
                </div>

                {viewMode === 'grid' && (
                <HousingListings 
                    housings={filteredHousings} 
                    isLoading={isLoading} 
                    onEdit={handleEdit}
                    favoritedIds={favoritedIds}
                />
                )}
                {viewMode === 'map' && (
                <Card>
                    <CardContent className="p-2">
                    <div className="h-[600px] w-full rounded-md overflow-hidden">
                        <MapView items={filteredHousings} itemType="housing" onMarkerClick={handleMarkerClick} />
                    </div>
                    </CardContent>
                </Card>
                )}
            </main>
        </div>
    </div>
  );
}
