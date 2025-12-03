'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, BookOpen, MessageSquare } from "lucide-react";
import Image from "next/image";
import type { Book } from "@/lib/types";
import { useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { collection } from "firebase/firestore";
import SocialSidebar from "@/components/social-sidebar";
import GlobalSearch from "@/components/global-search";
import NotificationsDropdown from "@/components/notifications-dropdown";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import CreateBookForm from '@/components/create-book-form';
import { getOrCreateConversation } from '@/lib/conversations';

function BookCard({ book, onContact }: { book: Book, onContact: (sellerId: string) => void }) {
    const { user } = useUser();
    const isOwner = user?.uid === book.sellerId;
    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-xl flex flex-col">
            <div className="relative aspect-square w-full">
                <Image src={book.imageUrl} alt={book.title} fill className="object-cover" />
            </div>
            <CardContent className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    <Badge variant="outline">{book.condition}</Badge>
                    <h3 className="text-lg font-bold mt-2 leading-tight">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">de {book.author}</p>
                    {book.university && <p className="text-xs text-muted-foreground mt-1">{book.university}</p>}
                    {book.course && <p className="text-xs text-muted-foreground">{book.course}</p>}
                </div>
                <div className="flex justify-between items-end mt-4 pt-4 border-t">
                    <p className="text-2xl font-bold text-primary">{book.price}€</p>
                    {!isOwner && (
                        <Button size="sm" onClick={() => onContact(book.sellerId)}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Contacter
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function BookListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between items-end pt-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-9 w-28" />
                </div>
            </CardContent>
        </Card>
      ))}
    </div>
  )
}


export default function BookMarketPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [titleFilter, setTitleFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');

  const booksCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'books');
  }, [firestore]);

  const { data: books, isLoading } = useCollection<Book>(booksCollection);

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books.filter(book => {
      const titleMatch = titleFilter ? book.title.toLowerCase().includes(titleFilter.toLowerCase()) : true;
      const courseMatch = courseFilter ? book.course?.toLowerCase().includes(courseFilter.toLowerCase()) : true;
      const universityMatch = universityFilter ? book.university?.toLowerCase().includes(universityFilter.toLowerCase()) : true;
      return titleMatch && courseMatch && universityMatch;
    });
  }, [books, titleFilter, courseFilter, universityFilter]);

  const handleContactSeller = async (sellerId: string) => {
    if (!user || !firestore) {
        router.push('/login?from=/books');
        return;
    }
    if (sellerId === user.uid) {
        toast({ variant: "destructive", title: "Action impossible", description: "Vous ne pouvez pas vous contacter vous-même." });
        return;
    }

    const conversationId = await getOrCreateConversation(firestore, user.uid, sellerId);
    if (conversationId) {
        router.push(`/messages/${conversationId}`);
    } else {
        toast({ title: "Erreur", description: "Impossible de démarrer la conversation.", variant: "destructive" });
    }
  };

  const handleCreateClick = () => {
    if (!user) {
        router.push('/login?from=/books');
        return;
    }
    setShowCreateForm(true);
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <SocialSidebar />
      <div className="flex flex-col flex-1">
        {showCreateForm && <CreateBookForm onClose={() => setShowCreateForm(false)} />}
        
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex-1 max-w-md">
                <GlobalSearch />
            </div>
            <div className="flex items-center gap-2">
                {user && <NotificationsDropdown />}
            </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
           <div className="mb-8">
             <h1 className="text-3xl font-bold tracking-tight">Marché aux Livres</h1>
             <p className="text-muted-foreground mt-1">Achetez et vendez vos livres de cours d'occasion.</p>
            </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Trouver un livre</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end" onSubmit={e => e.preventDefault()}>
                  <div className="space-y-2">
                      <Label htmlFor="title">Titre du livre</Label>
                      <Input id="title" placeholder="Ex: Principes de chimie" value={titleFilter} onChange={e => setTitleFilter(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="course">Matière / Cours</Label>
                      <Input id="course" placeholder="Ex: CHIM-F-101" value={courseFilter} onChange={e => setCourseFilter(e.target.value)}/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="university">Université / École</Label>
                      <Input id="university" placeholder="Ex: ULB" value={universityFilter} onChange={e => setUniversityFilter(e.target.value)}/>
                  </div>
              </form>
            </CardContent>
          </Card>


          <div className="mt-8">
            <div className="flex justify-between items-center mb-4 gap-4">
              <h2 className="text-2xl font-bold tracking-tight">Livres disponibles</h2>
              <div className="flex items-center gap-2">
                <Button onClick={handleCreateClick} disabled={isUserLoading}>
                  <Plus className="mr-2 h-4 w-4" /> Vendre un livre
                </Button>
              </div>
            </div>

            {isLoading && <BookListSkeleton />}
            {!isLoading && filteredBooks.map(book => (
                <BookCard key={book.id} book={book} onContact={handleContactSeller} />
            ))}
             {!isLoading && filteredBooks.length === 0 && (
                <Card className="text-center py-20 col-span-full">
                    <CardContent>
                        <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" strokeWidth={1}/>
                        <h3 className="text-xl font-semibold">Aucun livre ne correspond à votre recherche</h3>
                        <p className="text-muted-foreground mt-2">Essayez d'élargir vos critères ou soyez le premier à vendre un livre !</p>
                    </CardContent>
                </Card>
             )}
          </div>
        </main>
      </div>
    </div>
  );
}
