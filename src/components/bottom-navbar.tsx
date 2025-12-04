
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, PlusSquare, MessageSquare, User, Target, BookOpen } from 'lucide-react';
import { Button } from './ui/button';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useState, useEffect } from 'react';
import CreatePostForm from './create-post-form';
import { generateAvatar } from '@/lib/avatars';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

export default function BottomNavbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const publicPages = [
    '/', '/login', '/register', '/forgot-password', '/about',
    '/who-we-are', '/press', '/terms', '/privacy', '/help', '/contact',
    '/faq', '/community-rules'
  ];

  const hideNavbar = !user || publicPages.some(page => pathname === page);

  const getInitials = (email?: string | null) => {
    if (!email) return '..';
    const nameParts = user?.displayName?.split(' ');
    if(nameParts && nameParts.length > 1 && nameParts[0] && nameParts[1]) {
        return nameParts[0][0] + nameParts[1][0];
    }
    return email.substring(0, 2).toUpperCase();
  }

  const navItems = [
    { href: "/social", icon: Home },
    { href: "/challenges", icon: Target },
    { isAction: true, icon: PlusSquare, onClick: () => setShowCreatePost(true) },
    { href: "/messages", icon: MessageSquare },
    { href: "/profile", isProfile: true },
  ];
  
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {showCreatePost && <CreatePostForm onClose={() => setShowCreatePost(false)} />}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 h-16 bg-background border-t md:hidden z-40 transition-transform duration-300",
        hideNavbar ? "translate-y-full" : "translate-y-0"
      )}>
        <div className="flex justify-around items-center h-full">
          {navItems.map((item, index) => {
            if (item.isAction) {
              return (
                <Button key={index} variant="ghost" size="icon" onClick={item.onClick}>
                  <item.icon className="h-6 w-6" strokeWidth={2} />
                </Button>
              );
            }

            if (item.isProfile) {
              if (!user) {
                return <Skeleton key={index} className="h-7 w-7 rounded-full" />;
              }
              const isActive = pathname === item.href || pathname.startsWith('/profile/');
              return (
                <Link href={item.href || '#'} key={index}>
                  <Avatar className={`h-7 w-7 transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                    <AvatarImage src={user.photoURL || generateAvatar(user.email || user.uid)} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Link>
              );
            }
            
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link href={item.href || '#'} key={index}>
                <Icon
                  className={`h-6 w-6 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
