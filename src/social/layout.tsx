
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, GraduationCap, Car, Bed, PartyPopper, Search, Plus, User, Settings, LogOut } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import NotificationsDropdown from '@/components/notifications-dropdown';
import CreatePostForm from '@/components/create-post-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import UserSearch from '@/components/user-search';


const mainNavItems = [
  { href: "/social", label: "Accueil", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/housing", label: "Logements", icon: Bed },
  { href: "/carpooling", label: "Covoiturage", icon: Car },
  { href: "/tutoring", label: "Tutorat", icon: GraduationCap },
  { href: "/events", label: "Événements", icon: PartyPopper },
];


function NavLink({ item }: { item: { href?: string, id?: string, label: string, icon: React.ElementType }}) {
  const pathname = usePathname();
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

export default function SocialLayout({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();
    const { auth } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [showCreatePost, setShowCreatePost] = useState(false);

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

  return (
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r bg-card p-3 transition-all">
          <Link href="/social" className="mb-8 px-2 pt-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">STUD'IN</h1>
          </Link>

          <nav className="flex flex-col gap-2 flex-grow">
            {mainNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
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
          
          {/* Top Header */}
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
            {children}
          </main>
          
          {/* Mobile Bottom Nav */}
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
