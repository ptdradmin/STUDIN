
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageSquare, PlusSquare, Target, User } from 'lucide-react';
import { Button } from './ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useState, useEffect } from 'react';
import CreatePostForm from './create-post-form';
import { generateAvatar } from '@/lib/avatars';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';

export default function BottomNavbar() {
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore!, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const getInitials = (name?: string | null) => {
    if (!name) return '..';
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
      return nameParts[0][0] + nameParts[1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const navItems = [
    { href: '/social', icon: Home },
    { href: '/challenges', icon: Target },
    { isAction: true, icon: PlusSquare, onClick: () => setShowCreatePost(true) },
    { href: '/messages', icon: MessageSquare },
    { href: '/profile', isProfile: true },
  ];

  const publicPages = [
    '/', '/login', '/register', '/forgot-password', '/about',
    '/who-we-are', '/press', '/terms', '/privacy', '/help', '/contact',
    '/faq', '/community-rules'
  ];
  
  const isLoading = isUserLoading || isProfileLoading;
  const hideNavbar = !isClient || !user || publicPages.some(page => pathname === page) || pathname.startsWith('/reels');
  
  if (isLoading && !hideNavbar) {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t md:hidden z-40">
            <div className="flex justify-around items-center h-full">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-7 w-7 rounded-full" />
            </div>
        </div>
    );
  }

  return (
    <>
      {showCreatePost && <CreatePostForm onClose={() => setShowCreatePost(false)} />}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 h-16 bg-background border-t md:hidden z-40 transition-transform duration-300',
          hideNavbar ? 'translate-y-full' : 'translate-y-0'
        )}
      >
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
              if (!user || !userProfile) {
                return <Skeleton key={index} className="h-7 w-7 rounded-full" />;
              }
              const isActive = pathname === item.href || pathname.startsWith('/profile/');
              return (
                <Link href={item.href || '#'} key={index}>
                  <Avatar
                    className={`h-7 w-7 transition-all ${
                      isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                    }`}
                  >
                    <AvatarImage src={userProfile.profilePicture || generateAvatar(user.email || user.uid)} />
                    <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                  </Avatar>
                </Link>
              );
            }

            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link href={item.href || '#'} key={index}>
                <Icon
                  className={`h-6 w-6 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
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
