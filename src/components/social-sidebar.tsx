
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
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
import { GraduationCap, Home, Bed, Car, PartyPopper, User, Settings, LogOut, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mainNavItems = [
  { href: "/social", label: "Fil d'actualité", icon: Home },
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

export default function SocialSidebar() {
    const { user } = useUser();
    const { auth } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

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

    if (!user) return null;

    return (
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
    )
}
