
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, MessageSquare, PlusSquare, User, Menu, Film, LogOut, Settings, Bookmark, Phone, GraduationCap, Car, Bed, PartyPopper } from "lucide-react";
import { useUser } from "@/firebase";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import CreatePostForm from '@/components/create-post-form';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

const mainNavItems = [
  { href: "/social", label: "Accueil", icon: Home },
  { href: "#", label: "Appels", icon: Phone },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/tutoring", label: "Tutorat", icon: GraduationCap },
  { href: "/carpooling", label: "Covoiturage", icon: Car },
  { href: "/housing", label: "Logements", icon: Bed },
  { href: "/events", label: "Événements", icon: PartyPopper },
  { href: "/profile", label: "Profil", icon: User },
  { href: "/settings", label: "Paramètres", icon: Settings },
];


function NavLink({ item, onClick }: { item: { href?: string, id?: string, label: string, icon: React.ElementType }, onClick: (id?: string) => void }) {
  const pathname = usePathname();
  const { href, label, icon: Icon, id } = item;
  const isActive = href ? pathname.startsWith(href) : false;

  const content = (
    <Button 
      variant="ghost" 
      size="lg" 
      aria-label={label} 
      className="justify-start items-center gap-4 h-12 w-full"
      onClick={() => onClick(id)}
    >
      <Icon className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`} />
      <span className={`text-base ${isActive ? 'font-bold' : 'font-normal'}`}>{label}</span>
    </Button>
  );

  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>;
}

export default function SocialLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const { auth } = useAuth();
    const router = useRouter();
    const [showCreateForm, setShowCreateForm] = useState(false);

    const getInitials = (email?: string | null) => {
        if (!email) return '..';
        const nameParts = email.split('@')[0].replace('.', ' ');
        const initials = nameParts.split(' ').map(n => n[0]).join('');
        return initials.substring(0, 2).toUpperCase();
    }
    
    const handleNavClick = (id?: string) => {
      // Future use for panels
    }
    
    const handleLogout = async () => {
        if (auth) {
          await signOut(auth);
          router.push('/');
        }
    };

  return (
    <TooltipProvider>
      {showCreateForm && <CreatePostForm onClose={() => setShowCreateForm(false)} />}
      <div className="flex min-h-screen bg-background text-foreground">
        <aside 
            className={`fixed left-0 top-0 h-full z-20 flex flex-col p-3 bg-background border-r border-border transition-all duration-300 w-60`}
        >
          <Link href="/social" className={`mb-8 px-3 pt-3`}>
            <h1 className="text-2xl font-serif font-bold">Stud'in</h1>
          </Link>

          <nav className="flex flex-col gap-2 flex-grow">
            {mainNavItems.map((item) => (
              <NavLink key={item.label} item={item} onClick={handleNavClick} />
            ))}
             <Button 
                  variant="ghost" 
                  size="lg" 
                  aria-label="Créer" 
                  className="justify-start items-center gap-4 h-12 w-full"
                  onClick={() => setShowCreateForm(true)}
              >
                  <PlusSquare className="h-6 w-6" />
                  <span className={`text-base font-normal`}>Créer</span>
             </Button>
          </nav>
          
          <div className="mt-auto flex flex-col gap-2">
                 <Button variant="ghost" size="lg" className="justify-start items-center gap-4 h-12 w-full" onClick={handleLogout}>
                      <LogOut className="h-6 w-6" />
                      <span className={`text-base font-normal`}>Déconnexion</span>
                </Button>
          </div>
        </aside>
        
        <main className={`flex-1 transition-all duration-300 ml-60`}>
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
