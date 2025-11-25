
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, PlusSquare, MessageSquare, User } from 'lucide-react';
import { Button } from './ui/button';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useState } from 'react';
import CreatePostForm from './create-post-form';

export default function BottomNavbar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [showCreatePost, setShowCreatePost] = useState(false);

  if (!user) return null;

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
    { href: "/reels", icon: Film },
    { isAction: true, icon: PlusSquare, onClick: () => setShowCreatePost(true) },
    { href: "/messages", icon: MessageSquare },
    { href: "/profile", isProfile: true },
  ];

  return (
    <>
      {showCreatePost && <CreatePostForm onClose={() => setShowCreatePost(false)} />}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t md:hidden z-40">
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
              const isActive = pathname === item.href || pathname.startsWith('/profile/');
              return (
                <Link href={item.href || '#'} key={index}>
                  <Avatar className={`h-7 w-7 transition-all ${isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
                    <AvatarImage src={user?.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user?.email}`} />
                    <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
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
