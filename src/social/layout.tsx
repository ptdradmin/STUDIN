
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, User, Settings, MessageSquare, LogOut, Compass, PlusSquare, Search } from "lucide-react";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const navItems = [
  { href: "/social", label: "Accueil", icon: Home },
  { href: "/search", label: "Recherche", icon: Search },
  { href: "/explore", label: "Découvrir", icon: Compass },
  { href: "/messages", label: "Messages", icon: MessageSquare },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
     <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} passHref>
          <Button variant="ghost" size="lg" aria-label={label} className={`justify-start gap-3 ${isActive ? 'font-bold' : ''}`}>
            <Icon className="h-6 w-6" />
            <span className="hidden lg:inline">{label}</span>
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">
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
        <aside className="fixed left-0 top-0 h-full z-10 w-20 lg:w-60 flex flex-col p-3 bg-background border-r">
          <Link href="/social" className="px-3 mb-8 hidden lg:block">
             <span className="text-2xl font-serif tracking-tight font-bold">
              STUD'IN
            </span>
          </Link>
           <Link href="/social" className="mb-8 lg:hidden">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/logo.png" alt="Stud'in Logo" />
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
          </Link>

          <nav className="flex flex-col gap-2 flex-grow">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="lg" className="justify-start gap-3">
                        <PlusSquare className="h-6 w-6" />
                        <span className="hidden lg:inline">Créer</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Créer</p></TooltipContent>
            </Tooltip>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/profile">
                        <Button variant="ghost" size="lg" className="justify-start gap-3">
                             {user && (
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={user.photoURL ?? undefined} alt="User Avatar" />
                                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                                </Avatar>
                             )}
                            <span className="hidden lg:inline">Profil</span>
                        </Button>
                    </Link>
                </TooltipTrigger>
                 <TooltipContent side="right"><p>Profil</p></TooltipContent>
            </Tooltip>
          </nav>
          
          <div className="mt-auto flex flex-col gap-2">
             <Tooltip>
                <TooltipTrigger asChild>
                   <Button variant="ghost" size="lg" className="justify-start gap-3" onClick={handleLogout}>
                        <LogOut className="h-6 w-6" />
                        <span className="hidden lg:inline">Déconnexion</span>
                   </Button>
                </TooltipTrigger>
                <TooltipContent side="right"><p>Déconnexion</p></TooltipContent>
            </Tooltip>
          </div>
        </aside>
        <main className="flex-1 ml-20 lg:ml-60">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
