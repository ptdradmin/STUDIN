
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Search, Compass, MessageSquare, Heart, PlusSquare, User, Menu, Film } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import NotificationsDropdown from '@/components/notifications-dropdown';
import { useState } from 'react';
import CreatePostForm from '@/components/create-post-form';
import SearchPanel from '@/components/search-panel';

const mainNavItems = [
  { href: "/social", label: "Accueil", icon: Home },
  { id: "search", label: "Recherche", icon: Search },
  { href: "/events", label: "Découvrir", icon: Compass },
  { href: "/reels", label: "Reels", icon: Film },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

function NavLink({ item }: { item: { href?: string, id?: string, label: string, icon: React.ElementType } }) {
  const pathname = usePathname();
  const { href, label, icon: Icon, id } = item;
  const isActive = href ? pathname === href : false;

  const content = (
    <Button 
      variant="ghost" 
      size="lg" 
      aria-label={label} 
      className="justify-center lg:justify-start items-center gap-4 h-12 w-12 lg:w-full"
    >
      <Icon className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`} />
      <span className={`hidden lg:inline text-base ${isActive ? 'font-bold' : 'font-normal'}`}>{label}</span>
    </Button>
  );

  return (
     <Tooltip>
      <TooltipTrigger asChild>
        {href ? <Link href={href}>{content}</Link> : <div data-panel-id={id}>{content}</div>}
      </TooltipTrigger>
      <TooltipContent side="right" className="lg:hidden">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function SocialLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [activePanel, setActivePanel] = useState<string | null>(null);

    const getInitials = (email?: string | null) => {
        if (!email) return '..';
        const nameParts = email.split('@')[0].replace('.', ' ');
        const initials = nameParts.split(' ').map(n => n[0]).join('');
        return initials.substring(0, 2).toUpperCase();
    }
    
    const handleNavClick = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const panelId = target.closest('[data-panel-id]')?.getAttribute('data-panel-id');
        
        if (panelId) {
            setActivePanel(current => current === panelId ? null : panelId);
        }
    }

  return (
    <TooltipProvider>
      {showCreateForm && <CreatePostForm onClose={() => setShowCreateForm(false)} />}
      <div className="flex min-h-screen bg-background text-foreground">
        <aside 
            className={`fixed left-0 top-0 h-full z-20 flex flex-col p-3 bg-background border-r border-border transition-all duration-300 ${activePanel ? 'w-[72px] lg:w-[72px]' : 'w-[72px] lg:w-60'}`}
            onClick={handleNavClick}
        >
          <Link href="/social" className={`mb-8 px-3 ${activePanel ? 'hidden' : 'hidden lg:block'}`}>
            <h1 className="text-2xl font-serif font-bold">Stud'in</h1>
          </Link>
           <Link href="/social" className="mb-8 lg:hidden self-center">
              <Compass className="h-7 w-7" />
          </Link>

          <nav className="flex flex-col gap-2 flex-grow">
            {mainNavItems.map((item) => (
              <NavLink key={item.label} item={item} />
            ))}
             <Tooltip>
                <TooltipTrigger asChild>
                   <NotificationsDropdown />
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">
                  <p>Notifications</p>
                </TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                   <Button 
                        variant="ghost" 
                        size="lg" 
                        aria-label="Créer" 
                        className="justify-center lg:justify-start items-center gap-4 h-12 w-12 lg:w-full"
                        onClick={() => setShowCreateForm(true)}
                    >
                        <PlusSquare className="h-6 w-6" />
                        <span className={`hidden ${activePanel ? 'lg:hidden' : 'lg:inline'} text-base font-normal`}>Créer</span>
                   </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden"><p>Créer</p></TooltipContent>
            </Tooltip>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/profile" passHref>
                        <Button variant="ghost" size="lg" aria-label="Profil" className="justify-center lg:justify-start items-center gap-4 h-12 w-12 lg:w-full">
                           <Avatar className="h-6 w-6">
                                <AvatarImage src={user?.photoURL ?? undefined} />
                                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
                            </Avatar>
                            <span className={`hidden ${activePanel ? 'lg:hidden' : 'lg:inline'} text-base font-normal`}>Profil</span>
                        </Button>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden"><p>Profil</p></TooltipContent>
            </Tooltip>
          </nav>
          
          <div className="mt-auto flex flex-col gap-2">
             <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/settings">
                    <Button variant="ghost" size="lg" className="justify-center lg:justify-start items-center gap-4 h-12 w-12 lg:w-full">
                          <Menu className="h-6 w-6" />
                          <span className={`hidden ${activePanel ? 'lg:hidden' : 'lg:inline'} text-base font-normal`}>Plus</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden"><p>Plus</p></TooltipContent>
            </Tooltip>
          </div>
        </aside>

        <SearchPanel activePanel={activePanel} setActivePanel={setActivePanel} />
        
        <main className={`flex-1 transition-all duration-300 ${activePanel ? 'ml-[calc(72px+400px)]' : 'ml-[72px] lg:ml-60'}`}>
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
