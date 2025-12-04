

"use client";

import Link from "next/link";
import Image from "next/image";
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
import { Home, Car, BookOpen, PartyPopper, User, LogOut, Settings, Menu, GraduationCap, Target } from "lucide-react";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { generateAvatar } from "@/lib/avatars";

const navLinks = [
  { href: "/housing", label: "Logement", icon: <Home className="mr-2 h-4 w-4" /> },
  { href: "/carpooling", label: "Covoiturage", icon: <Car className="mr-2 h-4 w-4" /> },
  { href: "/tutoring", label: "Tutorat", icon: <BookOpen className="mr-2 h-4 w-4" /> },
  { href: "/books", label: "Marché aux livres", icon: <BookOpen className="mr-2 h-4 w-4" /> },
  { href: "/events", label: "Événements", icon: <PartyPopper className="mr-2 h-4 w-4" /> },
  { href: "/challenges", label: "Défis", icon: <Target className="mr-2 h-4 w-4" /> },
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
    if (parts.length > 1 && parts[0] && parts[1]) {
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

  const MobileNav = () => (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-6">
            <SheetTitle className="sr-only">Menu Principal</SheetTitle>
            <SheetDescription className="sr-only">Naviguez à travers les différentes sections de l'application.</SheetDescription>
          </SheetHeader>
        <div className="flex flex-col h-full px-6 pb-6">
            <Link href={user ? "/social" : "/"} className="flex items-center gap-2 mb-6" onClick={() => setIsSheetOpen(false)}>
                <Image src="/logo.png" alt="STUD'IN Logo" width={120} height={32} />
            </Link>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                <div className="flex items-center">{link.icon} {link.label}</div>
              </NavLink>
            ))}
          </nav>
           <div className="mt-auto">
                {user ? (
                   <div className="flex flex-col gap-2">
                       <Button variant="outline" asChild onClick={() => setIsSheetOpen(false)}>
                           <Link href="/profile">Mon Profil</Link>
                       </Button>
                       <Button variant="ghost" onClick={() => { handleLogout(); setIsSheetOpen(false); }}>
                           Déconnexion
                       </Button>
                   </div>
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
        <Link href={user ? "/social" : "/"} className="flex items-center gap-3">
            <Image src="/logo.png" alt="STUD'IN Logo" width={120} height={32} />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || generateAvatar(user.email || user.uid)} alt={user.displayName || user.email || ''} />
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
