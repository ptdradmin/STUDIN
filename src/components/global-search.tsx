
'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, limit, getDocs, orderBy, startAt, endAt } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Search, Loader2, User, Bed, PartyPopper, BookOpen } from 'lucide-react';
import type { UserProfile, Housing, Event, Tutor } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { useClickAway } from 'react-use';

type SearchResult = 
    | { type: 'user', data: UserProfile }
    | { type: 'housing', data: Housing }
    | { type: 'event', data: Event }
    | { type: 'tutor', data: Tutor };

const searchCollections = {
    users: { field: 'username', type: 'user', icon: <User className="h-4 w-4 text-muted-foreground"/> },
    housings: { field: 'title', type: 'housing', icon: <Bed className="h-4 w-4 text-muted-foreground"/> },
    events: { field: 'title', type: 'event', icon: <PartyPopper className="h-4 w-4 text-muted-foreground"/> },
    tutorings: { field: 'subject', type: 'tutor', icon: <BookOpen className="h-4 w-4 text-muted-foreground"/> },
};

export default function GlobalSearch() {
  const firestore = useFirestore();
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

          const querySnapshot = await getDocs(q);
          const items = querySnapshot.docs.map(doc => ({
              type: config.type,
              data: doc.data(),
          } as SearchResult));
          allResults = [...allResults, ...items];
      }
      
      setResults(allResults);
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

  const getResultLink = (item: SearchResult) => {
    switch (item.type) {
        case 'user': return `/profile/${item.data.id}`;
        case 'housing': return `/housing`;
        case 'event': return `/events`;
        case 'tutor': return `/tutoring/${item.data.id}`;
        default: return '#';
    }
  }
  
  const getResultContent = (item: SearchResult) => {
      const config = Object.values(searchCollections).find(c => c.type === item.type);
      switch(item.type) {
          case 'user':
              const u = item.data as UserProfile;
              return (
                  <>
                      <Avatar className="h-9 w-9">
                          <AvatarImage src={u.profilePicture} />
                          <AvatarFallback>{u.username.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="font-semibold text-sm">{u.username}</p>
                          <p className="text-xs text-muted-foreground">{u.firstName} {u.lastName}</p>
                      </div>
                  </>
              );
          case 'housing':
              const h = item.data as Housing;
              return (
                  <>{config?.icon}<div><p className="font-semibold text-sm">{h.title}</p><p className="text-xs text-muted-foreground">{h.city}</p></div></>
              );
          case 'event':
              const e = item.data as Event;
              return (
                 <>{config?.icon}<div><p className="font-semibold text-sm">{e.title}</p><p className="text-xs text-muted-foreground">{e.city}</p></div></>
              );
          case 'tutor':
               const t = item.data as Tutor;
              return (
                 <>{config?.icon}<div><p className="font-semibold text-sm">{t.subject}</p><p className="text-xs text-muted-foreground">par {t.username}</p></div></>
              );
          default: return null;
      }
  }

  const groupedResults = results.reduce((acc, item) => {
      if (!acc[item.type]) {
          acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="relative w-full" ref={searchRef}>
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

      {showResults && searchQuery && (
        <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {!isLoading && Object.keys(groupedResults).length > 0 ? (
            <div>
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase px-3 pt-3 pb-1">{type}</p>
                  {items.map((item, index) => (
                    <Link key={`${type}-${index}`} href={getResultLink(item)} onClick={handleLinkClick}>
                       <div className="flex items-center gap-3 p-3 hover:bg-muted">
                        {getResultContent(item)}
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
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
