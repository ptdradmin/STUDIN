
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import HousingListings from '@/components/housing-listings';
import { LayoutGrid, Map, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Housing, Favorite } from '@/lib/types';
import CreateHousingForm from '@/components/create-housing-form';
import { collection, query, where, getDocs, limit, startAfter, QueryDocumentSnapshot, DocumentData, orderBy } from 'firebase/firestore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SocialSidebar from '@/components/social-sidebar';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import { Slider } from '@/components/ui/slider';

const MapView = dynamic(() => import('@/components/map-view'), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg" />,
});

export default function HousingPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingHousing, setEditingHousing] = useState<Housing | null>(null);

    const [housings, setHousings] = useState<Housing[]>([]);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const [cityFilter, setCityFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [priceFilter, setPriceFilter] = useState(1000);

    const favoritesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, `users/${user.uid}/favorites`), where('itemType', '==', 'housing'));
    }, [user, firestore]);

<<<<<<< HEAD
  const { data: favorites } = useCollection<Favorite>(favoritesQuery as any);
  const favoritedIds = useMemo(() => new Set(favorites?.map(f => f.itemId)), [favorites]);
  
  const fetchHousings = useCallback(async (reset = false) => {
    if (!firestore) return;
    if (reset) {
        setIsLoading(true);
        setHousings([]);
        setLastVisible(null);
        setHasMore(true);
    } else {
        setIsLoadingMore(true);
    }

    let q = query(collection(firestore, 'housings'), orderBy('createdAt', 'desc'));
    
    if (!reset && lastVisible) {
        q = query(q, startAfter(lastVisible));
    }
    q = query(q, limit(8));
    
    try {
        const documentSnapshots = await getDocs(q);
        const newHousings = documentSnapshots.docs.map(doc => doc.data() as Housing);
        const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

        setHousings(prev => reset ? newHousings : [...prev, ...newHousings]);
        setLastVisible(lastDoc || null);
        if (documentSnapshots.docs.length < 8) {
            setHasMore(false);
=======
    const { data: favorites } = useCollection<Favorite>(favoritesQuery as any);
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

    const fetchHousings = useCallback(async (reset = false) => {
        if (!firestore) return;
        if (reset) {
            setIsLoading(true);
            setHousings([]);
            setLastVisible(null);
            setHasMore(true);
        } else {
            setIsLoadingMore(true);
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4
        }

        let q = query(collection(firestore, 'housings'), orderBy('createdAt', 'desc'));

        if (!reset && lastVisible) {
            q = query(q, startAfter(lastVisible));
        }
        q = query(q, limit(8));

        try {
            const documentSnapshots = await getDocs(q);
            const newHousings = documentSnapshots.docs.map(doc => doc.data() as Housing);
            const lastDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

            setHousings(prev => reset ? newHousings : [...prev, ...newHousings]);
            setLastVisible((lastDoc as any) || null);
            if (documentSnapshots.docs.length < 8) {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching housings:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [firestore, lastVisible]);

    useEffect(() => {
        fetchHousings(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleEdit = (housing: Housing) => {
        setEditingHousing(housing);
        setShowCreateForm(true);
    };

    const handleCloseForm = () => {
        setShowCreateForm(false);
        setEditingHousing(null);
    };

    const handleCreateClick = () => {
        if (isUserLoading) return;
        if (!user) {
            router.push('/login?from=/housing');
            return;
        }
        setEditingHousing(null);
        setShowCreateForm(true);
    }

  const filteredHousings = useMemo(() => {
    if (!housings) return [];
    return housings.filter(housing => {
      const cityMatch = cityFilter ? housing.city.toLowerCase().includes(cityFilter.toLowerCase()) : true;
      const typeMatch = typeFilter && typeFilter !== 'all' ? housing.type === typeFilter : true;
      const priceMatch = housing.price <= priceFilter;
      return cityMatch && typeMatch && priceMatch;
    });
  }, [housings, cityFilter, typeFilter, priceFilter]);


    return (
        <div className="flex min-h-screen w-full bg-background">
            {user && <SocialSidebar />}
            <div className="flex flex-col flex-1">
                {showCreateForm && <CreateHousingForm onClose={handleCloseForm} housingToEdit={editingHousing} />}

<<<<<<< HEAD
  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingHousing(null);
    fetchHousings(true); // Refetch to see changes
  };
=======
                {user ? (
                    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex-1 max-w-md">
                            <GlobalSearch />
                        </div>
                        <div className="flex items-center gap-2">
                            <NotificationsDropdown />
                        </div>
                    </header>
                ) : (
                    <Navbar />
                )}
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Logements Étudiants</h1>
                        <p className="text-muted-foreground mt-1">Trouvez votre prochain kot, studio ou colocation.</p>
                    </div>

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
<<<<<<< HEAD
                                    <Slider id="price" min={100} max={1000} step={25} value={[priceFilter]} onValueChange={(value) => setPriceFilter(value[0])} />
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <div className="flex justify-between items-center my-8">
                  <h2 className="text-2xl font-bold tracking-tight">Annonces récentes</h2>
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
                  <>
                    <HousingListings 
                        housings={filteredHousings} 
                        isLoading={isLoading} 
                        onEdit={handleEdit}
                        favoritedIds={favoritedIds}
                    />
                    {!isLoading && hasMore && (
                        <div className="text-center mt-8">
                            <Button onClick={() => fetchHousings()} disabled={isLoadingMore}>
                                {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Charger plus
=======
                                    <Input id="price" type="range" min="100" max="1000" step="25" value={priceFilter} onChange={e => setPriceFilter(Number(e.target.value))} />
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold tracking-tight">Annonces récentes</h2>
                        <div className="flex items-center gap-2">
                            <Button onClick={handleCreateClick} disabled={isUserLoading}>
                                <Plus className="mr-2 h-4 w-4" /> Ajouter une annonce
>>>>>>> 3c48d387fd1e53960e222d6e72c3dbfc2b771be4
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
                        <>
                            <HousingListings
                                housings={filteredHousings}
                                isLoading={isLoading}
                                onEdit={handleEdit}
                                favoritedIds={favoritedIds}
                            />
                            {!isLoading && hasMore && (
                                <div className="text-center mt-8">
                                    <Button onClick={() => fetchHousings()} disabled={isLoadingMore}>
                                        {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Charger plus
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                    {viewMode === 'map' && (
                        <Card>
                            <CardContent className="p-2">
                                <div className="h-[600px] w-full rounded-md overflow-hidden">
                                    <MapView items={filteredHousings} itemType="housing" onMarkerClick={(item) => router.push(`/housing/${item.id}`)} />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}
