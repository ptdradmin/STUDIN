
'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, limit, getDocs, orderBy, startAt, endAt } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import type { UserProfile, Housing, Event, Tutor } from '@/lib/types';
import Link from 'next/link';
import { useClickAway } from 'react-use';
import { useRouter } from 'next/navigation';
import SearchResultItem from './search-result-item';


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

export default function GlobalSearch() {
  const firestore = useFirestore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useClickAway(searchRef, () => {
    setShowResults(false);
  });
  
  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim() || !firestore) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      
      const searchTerm = searchQuery.toLowerCase();
      let allResults: SearchResult[] = [];

      for (const [col, config] of Object.entries(searchCollections)) {
          const q = query(
              collection(firestore, col), 
              orderBy(config.field),
              startAt(searchTerm),
              endAt(searchTerm + '\uf8ff'),
              limit(3)
          );

          try {
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({
                type: config.type,
                data: doc.data(),
            } as SearchResult));
            allResults = [...allResults, ...items];
          } catch(e) {
              console.error(`Could not search collection ${col}`, e);
          }
      }
      
      setResults(allResults.slice(0, 7)); // Limit total initial results
      setIsLoading(false);
    };

    const debounceTimer = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, firestore]);
  
  const handleLinkClick = () => {
    setShowResults(false);
    setSearchQuery('');
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      handleLinkClick();
    }
  }


  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-10 bg-muted border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
          />
          {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
      </form>

      {showResults && searchQuery && (
        <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && <div className="p-4 text-center text-sm text-muted-foreground">Recherche...</div>}
          {!isLoading && results.length > 0 ? (
            <div>
              {results.map((item, index) => (
                 <SearchResultItem key={index} item={item} onLinkClick={handleLinkClick} />
              ))}
              <div className="p-2 border-t">
                 <Button variant="link" asChild className="w-full">
                    <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} onClick={handleLinkClick}>
                        Voir tous les résultats
                    </Link>
                 </Button>
              </div>
            </div>
          ) : !isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucun résultat pour "{searchQuery}".
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
