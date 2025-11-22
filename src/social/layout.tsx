
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, GraduationCap, Car, Bed, PartyPopper, Search, Bell } from "lucide-react";
import { useUser } from "@/firebase";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const mainNavItems = [
  { href: "/social", label: "Accueil", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/tutoring", label: "Tutorat", icon: GraduationCap },
  { href: "/carpooling", label: "Covoiturage", icon: Car },
  { href: "/housing", label: "Logements", icon: Bed },
  { href: "/events", label: "Événements", icon: PartyPopper },
];


function NavLink({ item }: { item: { href?: string, id?: string, label: string, icon: React.ElementType }}) {
  const pathname = usePathname();
  const { href, label, icon: Icon } = item;
  const isActive = href ? pathname === href : false;

  return (
    <Link href={href || '#'}>
      <Button 
        variant={isActive ? "secondary" : "ghost"} 
        size="lg" 
        aria-label={label} 
        className={`justify-start items-center gap-3 h-12 w-full text-base ${isActive ? 'font-semibold text-primary-foreground bg-primary/10' : 'font-normal text-sidebar-foreground/80 hover:bg-primary/5 hover:text-sidebar-foreground'}`}
      >
        <Icon className={`h-6 w-6 ${isActive ? 'text-primary' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
        <span>{label}</span>
      </Button>
    </Link>
  );
}

export default function SocialLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const router = useRouter();
    
    const getInitials = (email?: string | null) => {
        if (!email) return '..';
        const parts = email.split('@')[0].replace('.', ' ').split(' ');
        if (parts.length > 1 && parts[0] && parts[1]) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return email.substring(0, 2).toUpperCase();
    }

  return (
      <div className="flex min-h-screen bg-background text-foreground">
        <aside 
            className="fixed left-0 top-0 h-full z-20 flex flex-col p-3 bg-sidebar-background border-r border-border/10 transition-all duration-300 w-64"
        >
          <Link href="/social" className="mb-8 px-3 pt-3 flex items-center gap-3">
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
        </aside>
        
        <div className="flex flex-col flex-1 transition-all duration-300 ml-64">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
             <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Link href="/profile">
               <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src={user?.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user?.email}`} />
                  <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                </Avatar>
            </Link>
          </header>
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
  );
}
