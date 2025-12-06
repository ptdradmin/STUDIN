
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Home, Bed, Car, PartyPopper, User, Settings, LogOut, Film, MessageSquare, BookOpen, Target, Trophy, LayoutDashboard, Sparkles, BadgeCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAvatar, getInitials } from '@/lib/avatars';
import { LogoIcon } from './logo-icon';
import { Skeleton } from './ui/skeleton';
import { ScrollArea } from './ui/scroll-area';

const mainNavItems = [
  { href: "/social", label: "Accueil", icon: Home, roles: ['student', 'institution', 'admin'] },
  { href: "/reels", label: "Reels", icon: Film, roles: ['student', 'institution', 'admin'] },
  { href: "/messages", label: "Messages", icon: MessageSquare, roles: ['student', 'institution', 'admin'] },
  { href: "/ai-chat", label: "Alice", icon: Sparkles, roles: ['student', 'institution', 'admin'] },
  { href: "/challenges", label: "Défis", icon: Target, roles: ['student', 'institution', 'admin'] },
  { href: "/leaderboard", label: "Classement", icon: Trophy, roles: ['student', 'institution', 'admin'] },
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, roles: ['institution', 'admin'] },
  { href: "/housing", label: "Logements", icon: Bed, roles: ['student'] },
  { href: "/carpooling", label: "Covoiturage", icon: Car, roles: ['student'] },
  { href: "/tutoring", label: "Tutorat", icon: BookOpen, roles: ['student'] },
  { href: "/books", label: "Marché aux livres", icon: BookOpen, roles: ['student'] },
  { href: "/events", label: "Événements", icon: PartyPopper, roles: ['student', 'institution', 'admin'] },
];

function NavLink({ item, pathname }: { item: { href?: string, label: string, icon: React.ElementType }, pathname: string}) {
  const { href, label, icon: Icon } = item;
  const isActive = href ? pathname.startsWith(href) : false;

  return (
    <Link href={href || '#'} className="block">
      <Button 
        variant={isActive ? "secondary" : "ghost"} 
        size="lg" 
        aria-label={label} 
        className={`justify-start items-center gap-4 h-12 w-full text-base ${isActive ? 'font-bold' : 'font-normal text-foreground/80 hover:text-foreground'}`}
      >
        <Icon className={`h-6 w-6 flex-shrink-0`} strokeWidth={isActive ? 2.5 : 2} />
        <span className="truncate">{label}</span>
      </Button>
    </Link>
  );
}

function SidebarSkeleton() {
    return (
        <aside className="hidden md:flex flex-col h-screen w-64 border-r bg-card p-3 transition-all">
            <div className="mb-4 px-2 pt-3">
                <Skeleton className="h-8 w-32" />
            </div>
            <ScrollArea className="flex-grow pr-3">
                <nav className="flex flex-col gap-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 h-12">
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    ))}
                </nav>
            </ScrollArea>
            <div className="flex items-center gap-3 p-2 mt-4 pt-4 border-t">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-grow space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </aside>
    );
}

export default function SocialSidebar() {
    const { user, isUserLoading } = useUser();
    const { auth } = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();
    
    const userProfileRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

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
    
    if (isUserLoading || profileLoading) {
        return <SidebarSkeleton />;
    }

    if (!user) {
        return null;
    }

    const userRole = userProfile?.role || 'student';
    const isPro = userProfile?.isPro || false;
    const visibleNavItems = mainNavItems.filter(item => item.roles.includes(userRole));

    return (
        <aside className="hidden md:flex flex-col h-screen w-64 border-r bg-card p-3 transition-all">
          <div className="mb-4 px-2 pt-3">
             <Link href="/social" className="flex items-center gap-2 text-2xl font-bold">
                <LogoIcon />
                <span className="font-headline">STUD'IN</span>
            </Link>
          </div>

          <ScrollArea className="flex-grow pr-3">
            <nav className="flex flex-col gap-1">
                {visibleNavItems.map((item) => (
                <NavLink key={item.label} item={item} pathname={pathname}/>
                ))}
            </nav>
          </ScrollArea>
          
          <div className="mt-4 pt-2 border-t">
             <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="justify-start items-center gap-3 h-auto py-2 w-full">
                        {user && <Avatar className="h-9 w-9">
                            <AvatarImage src={user?.photoURL || generateAvatar(user?.email || user.uid)} />
                            <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                        </Avatar>}
                        <div className="flex flex-col items-start overflow-hidden">
                            <p className="font-semibold text-sm truncate flex items-center gap-1.5">{user?.displayName || 'Utilisateur'} {isPro && <BadgeCheck className="h-4 w-4 text-primary" />}</p>
                            <p className="text-xs text-muted-foreground truncate">Voir les options</p>
                        </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mb-2" side="top" align="start">
                     <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none flex items-center gap-1.5">{user?.displayName || 'Utilisateur'} {isPro && <BadgeCheck className="h-4 w-4 text-primary" />}</p>
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
    )
}
