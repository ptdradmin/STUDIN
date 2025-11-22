
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { MessageSquare, User, Settings, LogOut, Compass, Home, Car, BookOpen, PartyPopper } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const appLinks = [
  { href: "/social", label: "Social", icon: <Compass /> },
  { href: "/housing", label: "Logement", icon: <Home /> },
  { href: "/carpooling", label: "Covoiturage", icon: <Car /> },
  { href: "/tutoring", label: "Tutorat", icon: <BookOpen /> },
  { href: "/events", label: "Événements", icon: <PartyPopper /> },
  { href: "/messages", label: "Messages", icon: <MessageSquare /> },
];

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, auth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    if (auth) {
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
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <Link href="/social" className="flex items-center gap-2">
                <div className="flex flex-col">
                    <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    STUD'IN
                    </span>
                </div>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
             {appLinks.map(link => (
                <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton asChild isActive={pathname === link.href}>
                        <Link href={link.href}>
                        {link.icon}
                        {link.label}
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {user && (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/profile'}>
                        <Link href="/profile">
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={user.photoURL ?? undefined} />
                                <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                            </Avatar>
                            <span>Mon Profil</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                        <Link href="/settings">
                        <Settings />
                        Paramètres
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                        <LogOut />
                        Déconnexion
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
