
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Car, BookOpen, PartyPopper, User, LogOut, Settings, Menu, Compass, MessageSquare } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/housing", label: "Logement", icon: <Home className="mr-2 h-4 w-4" /> },
  { href: "/carpooling", label: "Covoiturage", icon: <Car className="mr-2 h-4 w-4" /> },
  { href: "/tutoring", label: "Tutorat", icon: <BookOpen className="mr-2 h-4 w-4" /> },
  { href: "/events", label: "Événements", icon: <PartyPopper className="mr-2 h-4 w-4" /> },
];

export default function Navbar() {
  const { user } = useUser();
  const { auth } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
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

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={`text-sm font-medium transition-colors hover:text-primary ${pathname === href ? 'text-primary' : 'text-muted-foreground'}`}
      onClick={() => setIsSheetOpen(false)}
    >
      {children}
    </Link>
  );

  const isSocialPage = pathname.startsWith('/social');

  const MobileNav = () => (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="flex flex-col h-full">
            <Link href="/" className="flex items-center gap-2 mb-6" onClick={() => setIsSheetOpen(false)}>
              <div className="flex flex-col">
                 <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  STUD'IN
                </span>
              </div>
            </Link>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                <div className="flex items-center">{link.icon} {link.label}</div>
              </NavLink>
            ))}
            {user && (
              <>
                <NavLink href="/social">
                  <div className="flex items-center"><Compass className="mr-2 h-4 w-4" /> Social</div>
                </NavLink>
                {isSocialPage && (
                  <NavLink href="/messages">
                    <div className="flex items-center"><MessageSquare className="mr-2 h-4 w-4" /> Messages</div>
                  </NavLink>
                )}
              </>
            )}
          </nav>
           <div className="mt-auto">
            {user ? (
                 <DropdownMenu>
                  <DropdownMenuTrigger className="w-full">
                    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted w-full text-left">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`} alt={user.displayName || user.email || ''} />
                            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow truncate">
                            <p className="text-sm font-medium truncate">{user.displayName || 'Utilisateur'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mb-2" align="start" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/profile"><User className="mr-2 h-4 w-4" /><span>Profil</span></Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings"><Settings className="mr-2 h-4 w-4" /><span>Paramètres</span></Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /><span>Déconnexion</span></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="flex flex-col gap-2">
                    <Button variant="ghost" asChild onClick={() => setIsSheetOpen(false)}><Link href="/login">Connexion</Link></Button>
                    <Button asChild onClick={() => setIsSheetOpen(false)}><Link href="/register">Inscription</Link></Button>
                </div>
            )}
           </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex flex-col">
             <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              STUD'IN
            </span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
           {user && (
              <>
                <NavLink href="/social">
                  Social
                </NavLink>
                {isSocialPage && (
                  <NavLink href="/messages">
                    Messages
                  </NavLink>
                )}
              </>
            )}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`} alt={user.displayName || user.email || ''} />
                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.displayName || 'Utilisateur'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
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
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Connexion</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Inscription</Link>
                  </Button>
                </>
              )}
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
