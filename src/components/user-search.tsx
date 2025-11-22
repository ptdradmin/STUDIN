
'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Link from 'next/link';
import { useClickAway } from 'react-use';

export default function UserSearch() {
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useClickAway(searchRef, () => {
    setShowResults(false);
  });
  
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || !firestore) {
        setResults([]);
        return;
      }
      setIsLoading(true);
      
      const searchTerm = searchQuery.toLowerCase();
      const usersRef = collection(firestore, 'users');
      // Firestore does not support case-insensitive or partial text search natively.
      // This query finds usernames that start with the search term.
      const q = query(usersRef, where('username', '>=', searchTerm), where('username', '<=', searchTerm + '\uf8ff'), limit(10));
      
      try {
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => doc.data() as UserProfile);
        setResults(users);
      } catch (error) {
        console.error("Error searching users:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, firestore]);
  
  const getInitials = (name?: string) => {
    if (!name) return '..';
    return name.substring(0, 2).toUpperCase();
  };

  const handleLinkClick = () => {
    setShowResults(false);
    setSearchQuery('');
  }

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
        <div className="absolute top-full mt-2 w-full bg-card border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <div className="divide-y">
              {results.map((user) => (
                <Link key={user.id} href={`/profile/${user.id}`} onClick={handleLinkClick}>
                   <div className="flex items-center gap-3 p-3 hover:bg-muted">
                    <Avatar>
                      <AvatarImage src={user.profilePicture} />
                      <AvatarFallback>{getInitials(user.firstName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.firstName} {user.lastName}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : !isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucun utilisateur trouvé pour "{searchQuery}".
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
