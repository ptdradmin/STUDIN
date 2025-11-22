
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, User, Settings, MessageSquare, LogOut, Compass, Search, Building, Car, GraduationCap, PartyPopper } from "lucide-react";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const mainNavItems = [
  { href: "/social", label: "Accueil", icon: Home },
  { href: "/housing", label: "Logement", icon: Building },
  { href: "/carpooling", label: "Covoiturage", icon: Car },
  { href: "/tutoring", label: "Tutorat", icon: GraduationCap },
  { href: "/events", label: "Événements", icon: PartyPopper },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

const secondaryNavItems = [
    { href: "/explore", label: "Découvrir", icon: Compass },
    { href: "/profile", label: "Profil", icon: User },
    { href: "/settings", label: "Paramètres", icon: Settings },
]

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
     <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} passHref>
          <Button variant={isActive ? "secondary" : "ghost"} size="lg" aria-label={label} className="justify-start gap-3">
            <Icon className="h-6 w-6" />
            <span className="hidden lg:inline">{label}</span>
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="lg:hidden">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function SocialLayout({ children }: { children: React.ReactNode }) {
    const { user, auth } = useAuth();
    const router = useRouter();

     const handleLogout = async () => {
        if(auth) {
            await signOut(auth);
            router.push('/');
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
    <TooltipProvider>
      <div className="flex min-h-screen bg-background">
        <aside className="fixed left-0 top-0 h-full z-10 w-20 lg:w-64 flex flex-col p-3 bg-card border-r">
          <Link href="/social" className="px-3 mb-8 hidden lg:block">
             <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              STUD'IN
            </span>
          </Link>
           <Link href="/social" className="mb-8 lg:hidden self-center">
              <Avatar className="h-10 w-10">
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
          </Link>

          <nav className="flex flex-col gap-2 flex-grow">
            {mainNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
          
          <div className="mt-auto flex flex-col gap-2">
             {secondaryNavItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
             <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="ghost" size="lg" className="justify-start gap-3" onClick={handleLogout}>
                        <LogOut className="h-6 w-6" />
                        <span className="hidden lg:inline">Déconnexion</span>
                   </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden"><p>Déconnexion</p></TooltipContent>
            </Tooltip>
          </div>
        </aside>
        <main className="flex-1 ml-20 lg:ml-64">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
