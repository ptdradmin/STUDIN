
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, GraduationCap, Car, Bed, PartyPopper, Search, Bell, User, Settings, LogOut, Plus } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const mainNavItems = [
  { href: "/social", label: "Accueil", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/tutoring", label: "Tutorat", icon: GraduationCap },
  { href: "/carpooling", label: "Covoiturage", icon: Car },
  { href: "/housing", label: "Logements", icon: Bed },
  { href: "/events", label: "Événements", icon: PartyPopper },
];
const secondaryNavItems = [
    { href: "/profile", label: "Profil", icon: User },
    { href: "/settings", label: "Paramètres", icon: Settings },
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
        className={`justify-start items-center gap-4 h-12 w-full text-base ${isActive ? 'font-bold text-sidebar-foreground' : 'font-normal text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground'}`}
      >
        <Icon className={`h-6 w-6`} strokeWidth={isActive ? 2.5 : 2} />
        <span className="truncate">{label}</span>
      </Button>
    </Link>
  );
}

export default function SocialLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const { auth } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
            toast({
                title: "Déconnexion",
                description: "Vous avez été déconnecté avec succès.",
            });
            router.push('/login');
        }
    };
    
    const getInitials = (email?: string | null) => {
        if (!email) return '..';
        const parts = email.split('@')[0].replace('.', ' ').split(' ');
        if (parts.length > 1 && parts[0] && parts[1]) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return email.substring(0, 2).toUpperCase();
    }

  return (
      <div className="flex min-h-screen w-full bg-background text-foreground">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r bg-sidebar-background p-3 transition-all">
          <Link href="/social" className="mb-8 px-2 pt-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-sidebar-foreground">STUD'IN</h1>
          </Link>

          <nav className="flex flex-col gap-2 flex-grow">
            {mainNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
          </nav>
          <div className="flex flex-col gap-2">
            {secondaryNavItems.map((item) => (
                <NavLink key={item.label} item={item} />
            ))}
             <Button 
                variant="ghost" 
                size="lg" 
                aria-label="Déconnexion" 
                className="justify-start items-center gap-4 h-12 w-full text-base font-normal text-sidebar-foreground/80 hover:bg-white/5 hover:text-sidebar-foreground"
                onClick={handleLogout}
             >
                <LogOut className="h-6 w-6" />
                <span>Déconnexion</span>
            </Button>
          </div>
        </aside>
        
        <div className="flex flex-col flex-1">
          {/* Top Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex-1 md:hidden">
                 <Link href="/social" className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-md bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <h1 className="text-lg font-bold">STUD'IN</h1>
                  </Link>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-5 w-5" />
            </Button>
             <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-5 w-5" />
            </Button>
            <Link href="/profile">
               <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src={user?.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user?.email}`} />
                  <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                </Avatar>
            </Link>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {children}
          </main>
          
          {/* Mobile Bottom Nav */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-2 flex justify-around">
            <Link href="/social" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary"><Home className="h-6 w-6" /><span className="text-xs">Accueil</span></Link>
            <Link href="/messages" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary"><MessageSquare className="h-6 w-6" /><span className="text-xs">Messages</span></Link>
            <button className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary"><div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center -mt-6 border-4 border-background"><Plus className="h-6 w-6"/></div></button>
            <Link href="/events" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary"><PartyPopper className="h-6 w-6" /><span className="text-xs">Événements</span></Link>
            <Link href="/profile" className="flex flex-col items-center justify-center text-muted-foreground hover:text-primary"><User className="h-6 w-6" /><span className="text-xs">Profil</span></Link>
          </nav>
        </div>
      </div>
  );
}
