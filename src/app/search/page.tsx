
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import SocialSidebar from '@/components/social-sidebar';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, limit, getDocs, orderBy, startAt, endAt, where } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile, Housing, Event, Tutor } from '@/lib/types';
import SearchResultItem from '@/components/search-result-item';
import { Skeleton } from '@/components/ui/skeleton';

type SearchResult = 
    | { type: 'user', data: UserProfile }
    | { type: 'housing', data: Housing }
    | { type: 'event', data: Event }
    | { type: 'tutor', data: Tutor };

const searchCollections = {
    users: { field: 'username', type: 'user' },
    housings: { field: 'title', type: 'housing' },
    events: { field: 'title', type: 'event' },
    tutorings: { field: 'subject', type: 'tutor' },
};

function SearchResults() {
    const searchParams = useSearchParams();
    const q = searchParams.get('q');
    const firestore = useFirestore();

    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const performSearch = async () => {
            if (!q || !firestore) {
                setResults([]);
                return;
            }
            setIsLoading(true);
            const searchTerm = q.toLowerCase();
            let allResults: SearchResult[] = [];

             for (const [col, config] of Object.entries(searchCollections)) {
                const firestoreQuery = query(
                    collection(firestore, col),
                    orderBy(config.field),
                    startAt(searchTerm),
                    endAt(searchTerm + '\uf8ff'),
                    limit(20)
                );
                
                try {
                    const querySnapshot = await getDocs(firestoreQuery);
                    const items = querySnapshot.docs.map(doc => ({
                        type: config.type,
                        data: doc.data(),
                    } as SearchResult));
                    allResults = [...allResults, ...items];
                } catch (error) {
                    console.error(`Error searching in ${col}:`, error)
                }
            }
            
            setResults(allResults);
            setIsLoading(false);
        };
        performSearch();
    }, [q, firestore]);

    const filteredResults = (type: string) => {
        if (type === 'all') return results;
        return results.filter(r => r.type === type);
    }
    
    const renderTabContent = (type: string) => {
        const data = filteredResults(type);
        
        if (isLoading) {
            return (
                <div className="space-y-3 mt-4">
                    {Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <Skeleton className="h-10 w-10 rounded-full" />
                           <div className="space-y-1">
                               <Skeleton className="h-4 w-32" />
                               <Skeleton className="h-3 w-24" />
                           </div>
                        </div>
                    ))}
                </div>
            )
        }

        if (data.length === 0) {
            return <p className="text-muted-foreground text-center mt-8">Aucun résultat dans cette catégorie.</p>
        }

        return (
            <div className="space-y-1 mt-4">
                {data.map((item, index) => (
                    <SearchResultItem key={index} item={item} />
                ))}
            </div>
        )
    }

    if (!q) {
        return <p className="text-muted-foreground text-center mt-8">Commencez par une recherche dans la barre ci-dessus.</p>
    }

    return (
        <div>
            <h1 className="text-2xl font-bold tracking-tight">Résultats pour "{q}"</h1>

            <Tabs defaultValue="all" className="mt-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">Tout</TabsTrigger>
                    <TabsTrigger value="user">Utilisateurs</TabsTrigger>
                    <TabsTrigger value="housing">Logements</TabsTrigger>
                    <TabsTrigger value="event">Événements</TabsTrigger>
                    <TabsTrigger value="tutor">Tutorat</TabsTrigger>
                </TabsList>
                <TabsContent value="all">{renderTabContent('all')}</TabsContent>
                <TabsContent value="user">{renderTabContent('user')}</TabsContent>
                <TabsContent value="housing">{renderTabContent('housing')}</TabsContent>
                <TabsContent value="event">{renderTabContent('event')}</TabsContent>
                <TabsContent value="tutor">{renderTabContent('tutor')}</TabsContent>
            </Tabs>
        </div>
    )
}

export default function SearchPage() {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex flex-col flex-1">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="hidden md:flex flex-1 max-w-md items-center">
                        <GlobalSearch />
                    </div>
                    <div className="flex-1 md:hidden">
                        <Button variant="ghost" size="icon"><SearchIcon className="h-6 w-6" /></Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationsDropdown />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-2xl mx-auto">
                      <Suspense fallback={<div>Chargement...</div>}>
                        <SearchResults />
                      </Suspense>
                    </div>
                </main>
            </div>
        </div>
    )
}
