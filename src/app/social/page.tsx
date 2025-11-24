'use client';

import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Post, UserProfile } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { PageSkeleton, CardSkeleton } from '@/components/page-skeleton';
import PostCard from '@/components/post-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, Home, MessageSquare, Bed, Car, PartyPopper, Plus, User, Settings, LogOut, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import CreatePostForm from '@/components/create-post-form';
import NotificationsDropdown from '@/components/notifications-dropdown';
import UserSearch from '@/components/user-search';

function SuggestionsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({length: 5}).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-grow space-y-1">
                            <Skeleton className="h-4 w-2/3" />
                             <Skeleton className="h-3 w-1/3" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function Suggestions() {
    const { user } = useUser();
    const firestore = useFirestore();

    const suggestionsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'users'),
            limit(10)
        );
    }, [firestore, user]);

    const { data: suggestedUsers, isLoading } = useCollection<UserProfile>(suggestionsQuery);

     const getInitials = (name?: string) => {
        if (!name) return "..";
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }
    
    const filteredSuggestions = suggestedUsers?.filter(u => u.id !== user?.uid).slice(0, 5);

    if (isLoading) {
        return <SuggestionsSkeleton />;
    }

    if (!filteredSuggestions || filteredSuggestions.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Suggestions pour vous</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {filteredSuggestions.map(u => (
                    <div key={u.id} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={u.profilePicture} />
                            <AvatarFallback>{getInitials(u.firstName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow overflow-hidden">
                            <Link href={`/profile/${u.id}`} className="font-semibold text-sm hover:underline truncate block">{u.username}</Link>
                            <p className="text-xs text-muted-foreground truncate">Suggéré pour vous</p>
                        </div>
                        <Button variant="link" size="sm" asChild className="p-0 h-auto">
                            <Link href={`/profile/${u.id}`}>Suivre</Link>
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

const mainNavItems = [
  { href: "/social", label: "Accueil", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/housing", label: "Logements", icon: Bed },
  { href: "/carpooling", label: "Covoiturage", icon: Car },
  { href: "/tutoring", label: "Tutorat", icon: GraduationCap },
  { href: "/events", label: "Événements", icon: PartyPopper },
];


function NavLink({ item, pathname }: { item: { href?: string, label: string, icon: React.ElementType }, pathname: string}) {
  const { href, label, icon: Icon } = item;
  const isActive = href ? pathname === href : false;

  return (
    <Link href={href || '#'} className="block">
      <Button 
        variant={isActive ? "secondary" : "ghost"} 
        size="lg" 
        aria-label={label} 
        className={`justify-start items-center gap-4 h-12 w-full text-base ${isActive ? 'font-bold' : 'font-normal text-muted-foreground'}`}
      >
        <Icon className={`h-6 w-6`} strokeWidth={isActive ? 2.5 : 2} />
        <span className="truncate">{label}</span>
      </Button>
    </Link>
  );
}


export default function SocialPage() {
    const { user, isUserLoading } = useUser();
    const { auth } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [showCreatePost, setShowCreatePost] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login?from=/social');
        }
    }, [user, isUserLoading, router]);

    const postsQuery = useMemoFirebase(
        () => !firestore ? null : query(collection(firestore, 'posts'), orderBy('createdAt', 'desc')),
        [firestore]
    );

    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
            toast({
                title: "Déconnexion",
                description: "Vous avez été déconnecté avec succès.",
            });
            router.push('/');
        }
    };
    
    const getInitials = (email?: string | null) => {
        if (!email) return '..';
        const nameParts = user?.displayName?.split(' ');
        if(nameParts && nameParts.length > 1 && nameParts[0] && nameParts[1]) {
            return nameParts[0][0] + nameParts[1][0];
        }
        return email.substring(0, 2).toUpperCase();
    }
    
    if (isUserLoading || !user) {
        return <PageSkeleton />;
    }

    return (
       <div className="flex min-h-screen w-full bg-background">
        <aside className="hidden md:flex flex-col w-64 border-r bg-card p-3 transition-all">
          <Link href="/social" className="mb-8 px-2 pt-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">STUD'IN</h1>
          </Link>

          <nav className="flex flex-col gap-2 flex-grow">
            {mainNavItems.map((item) => (
              <NavLink key={item.label} item={item} pathname={pathname}/>
            ))}
          </nav>
          
          <div className="flex flex-col gap-2">
             <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="justify-start items-center gap-3 h-14 w-full">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user?.email}`} />
                            <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start overflow-hidden">
                            <p className="font-semibold text-sm truncate">{user?.displayName || 'Utilisateur'}</p>
                            <p className="text-xs text-muted-foreground truncate">Voir les options</p>
                        </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                     <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.displayName || 'Utilisateur'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Paramètres</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
          </div>
        </aside>
        
        <div className="flex flex-col flex-1">
          {showCreatePost && <CreatePostForm onClose={() => setShowCreatePost(false)} />}
          
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between md:justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex-1 md:hidden">
                 <Link href="/social" className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <h1 className="text-lg font-bold">STUD'IN</h1>
                  </Link>
            </div>
            
            <div className="hidden md:flex flex-1 max-w-md items-center">
                <UserSearch />
            </div>

            <div className="flex items-center gap-2">
                <div className="md:hidden">
                    <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
                </div>
                <Button onClick={() => setShowCreatePost(true)} size="sm" className="hidden md:flex items-center gap-2" disabled={isUserLoading || !user}>
                    <Plus className="h-4 w-4" />
                    Créer
                </Button>
                 <NotificationsDropdown />
                <Link href="/profile" className="md:hidden">
                   <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src={user?.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user?.email}`} />
                      <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                    </Avatar>
                </Link>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
             <div className="w-full">
                <div className="container mx-auto max-w-4xl px-0 md:px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,290px] gap-8 items-start">
                        <div className="space-y-4 w-full max-w-[470px] mx-auto">
                             {postsLoading ? (
                                Array.from({length: 3}).map((_, i) => <CardSkeleton key={i}/>)
                             ) : posts && posts.length > 0 ? (
                                posts.map(post => <PostCard key={post.id} post={post} />)
                            ) : (
                                <div className="text-center p-10 text-muted-foreground bg-card md:border rounded-lg">
                                    <p className="text-lg font-semibold">Le fil d'actualité est vide.</p>
                                    <p className="text-sm">Soyez le premier à poster quelque chose !</p>
                                </div>
                            )}
                        </div>
                        <div className="hidden md:block">
                             <div className="sticky top-20">
                                <Suggestions />
                             </div>
                        </div>
                    </div>
                </div>
           </div>
          </main>
          
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-2 flex justify-around z-40">
            <Link href="/social" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary w-1/5"><Home className="h-6 w-6" /><span className="text-xs">Accueil</span></Link>
            <Link href="/messages" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary w-1/5"><MessageSquare className="h-6 w-6" /><span className="text-xs">Messages</span></Link>
            <button className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary w-1/5" onClick={() => setShowCreatePost(true)} disabled={isUserLoading || !user}>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center -mt-6 border-4 border-background">
                    <Plus className="h-6 w-6"/>
                </div>
            </button>
            <Link href="/events" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary w-1/5"><PartyPopper className="h-6 w-6" /><span className="text-xs">Événements</span></Link>
            <Link href="/profile" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary w-1/5"><User className="h-6 w-6" /><span className="text-xs">Profil</span></Link>
          </nav>
        </div>
      </div>
    );
}
