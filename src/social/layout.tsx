
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, User, Settings, MessageSquare, LogOut } from "lucide-react";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const navItems = [
  { href: "/social", label: "Fil d'actualité", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/profile", label: "Profil", icon: User },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
     <Tooltip>
      <TooltipTrigger asChild>
        <Link href={href} passHref>
          <Button variant={isActive ? "secondary" : "ghost"} size="icon" aria-label={label}>
            <Icon className="h-6 w-6" />
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
        if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return email.substring(0, 2).toUpperCase();
    }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-muted/40">
        <aside className="w-16 flex flex-col items-center space-y-4 py-4 bg-background border-r">
          <Link href="/social" className="mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/logo.png" alt="Stud'in Logo" />
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
          </Link>
          <nav className="flex flex-col items-center space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
          <div className="mt-auto flex flex-col items-center space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Déconnexion">
                  <LogOut className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Déconnexion</p>
              </TooltipContent>
            </Tooltip>
            {user && (
              <Link href="/profile" passHref>
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarImage src={user.photoURL ?? undefined} alt="User Avatar" />
                  <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        </aside>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </TooltipProvider>
  );
}
