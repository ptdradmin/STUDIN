
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Search, Compass, MessageSquare, Heart, PlusSquare, User, Menu, Film, LogOut, Settings, Bookmark, Phone, GraduationCap, Car, Bed, PartyPopper } from "lucide-react";
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
import SearchPanel from '@/components/search-panel';
import NotificationsDropdown from '@/components/notifications-dropdown';

const mainNavItems = [
  { href: "/social", label: "Accueil", icon: Home },
  { href: "#", label: "Appels", icon: Phone },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/tutoring", label: "Tutorat", icon: GraduationCap },
  { href: "/carpooling", label: "Covoiturage", icon: Car },
  { href: "/housing", label: "Logements", icon: Bed },
  { href: "/events", label: "Événements", icon: PartyPopper },
];


function NavLink({ item, onClick }: { item: { href?: string, id?: string, label: string, icon: React.ElementType }, onClick: (id?: string) => void }) {
  const pathname = usePathname();
  const { href, label, icon: Icon, id } = item;
  const isActive = href ? pathname === href : false;

  const content = (
    <Button 
      variant="ghost" 
      size="lg" 
      aria-label={label} 
      className="justify-center lg:justify-start items-center gap-4 h-12 w-12 lg:w-full"
      onClick={() => onClick(id)}
    >
      <Icon className={`h-6 w-6 ${isActive ? 'fill-current' : ''}`} />
      <span className={`hidden lg:inline text-base ${isActive ? 'font-bold' : 'font-normal'}`}>{label}</span>
    </Button>
  );

  return (
     <Tooltip>
      <TooltipTrigger asChild>
        {href ? <Link href={href}>{content}</Link> : <div>{content}</div>}
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
    
    const handleNavClick = (id?: string) => {
        if (id) {
            setActivePanel(current => current === id ? null : id);
        } else {
             setActivePanel(null);
        }
    }

  return (
    <TooltipProvider>
      {showCreateForm && <CreatePostForm onClose={() => setShowCreateForm(false)} />}
      <div className="flex min-h-screen bg-background text-foreground">
        <aside 
            className={`fixed left-0 top-0 h-full z-20 flex flex-col p-3 bg-background border-r border-border transition-all duration-300 ${activePanel ? 'w-[72px]' : 'w-[72px] lg:w-60'}`}
        >
          <Link href="/social" className={`mb-8 px-3 pt-3 hidden ${activePanel ? 'lg:hidden' : 'lg:block'}`}>
            <h1 className="text-2xl font-serif font-bold">Stud'in</h1>
          </Link>
           <Link href="/social" className={`mb-8 self-center pt-3 ${activePanel ? 'lg:block' : 'lg:hidden'}`}>
              <Compass className="h-7 w-7" />
          </Link>

          <nav className="flex flex-col gap-2 flex-grow">
            {mainNavItems.map((item) => (
              <NavLink key={item.label} item={item} onClick={handleNavClick} />
            ))}
             <Tooltip>
                <TooltipTrigger asChild>
                   <div onClick={() => handleNavClick('notifications')} className="cursor-pointer">
                        <NotificationsDropdown />
                   </div>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="lg" className="justify-center lg:justify-start items-center gap-4 h-12 w-12 lg:w-full">
                      <Menu className="h-6 w-6" />
                      <span className={`hidden ${activePanel ? 'lg:hidden' : 'lg:inline'} text-base font-normal`}>Plus</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2 ml-2" side="top" align="start">
                <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2 h-4 w-4" /><span>Paramètres</span></Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/profile?tab=saved"><Bookmark className="mr-2 h-4 w-4" /><span>Enregistré</span></Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" /><span>Se déconnecter</span></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <SearchPanel activePanel={activePanel} setActivePanel={setActivePanel} />
        
        <main className={`flex-1 transition-all duration-300 ml-[72px] ${activePanel ? 'lg:ml-[calc(72px+400px)]' : 'lg:ml-60'}`}>
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
