
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PostCard from "@/components/post-card";
import { Camera, Home, Plus, Search } from 'lucide-react';
import Link from "next/link";
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Settings, MessageSquare } from "lucide-react";
import { Input } from './ui/input';
import { useUser, useAuth, useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { signOut } from 'firebase/auth';
import type { Post } from '@/lib/types';
import CreatePostForm from './create-post-form';
import { collection, orderBy, query } from 'firebase/firestore';
import NotificationsDropdown from './notifications-dropdown';

const reelsUsers = [
  { name: "Alice", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=alice" },
  { name: "Bob", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=bob" },
  { name: "Charlie", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=charlie" },
  { name: "Diana", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=diana" },
  { name: "Eva", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=eva" },
  { name: "Frank", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=frank" },
  { name: "Grace", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=grace" },
];

function ReelsTray() {
  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-0 py-3 border-b md:border-x md:rounded-t-lg">
      <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2">
        {reelsUsers.map((user) => (
          <div key={user.name} className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer group">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 group-hover:animate-pulse"></div>
              <Avatar className="h-16 w-16 border-2 border-background relative">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <span className="text-xs truncate w-16 text-center">{user.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function SocialSkeleton() {
    return (
        <div className="max-w-xl mx-auto">
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                     <CardSkeleton key={i} />
                ))}
            </div>
        </div>
    )
}

function CardSkeleton() {
    return (
        <div className="rounded-none md:rounded-lg border-x-0 md:border p-3">
             <div className="flex items-center gap-3 mb-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="aspect-square w-full" />
            <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-48" />
            </div>
        </div>
    )
}

export function PageSkeleton() {
    return (
        <>
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <Skeleton className="h-8 w-40" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8" />
                         <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-0 md:px-4 py-4">
                <SocialSkeleton />
            </main>
        </>
    )
}


export default function SocialClientPage() {
    const { user, isUserLoading } = useUser();
    const { auth } = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    
    const postsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'posts'), orderBy('createdAt', 'desc'));
    }, [firestore]);
    const { data: posts, isLoading: postsLoading } = useCollection<Post>(postsQuery);
    
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login?from=/social');
        }
    }, [user, isUserLoading, router]);


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
    
    const isLoading = isUserLoading || postsLoading;

    if (isLoading) {
        return <PageSkeleton />;
    }
    
    if (!user) {
        return <PageSkeleton />;
    }


    return (
         <>
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                 <div className="container flex h-16 items-center justify-between gap-4">
                    <Link href="/social" className="hidden md:block">
                        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                            STUD'IN Social
                        </h1>
                    </Link>

                     <div className="relative flex-grow max-w-xs hidden md:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher" className="pl-8" />
                    </div>

                    <div className="flex items-center gap-1 md:gap-2">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/social">
                                <Home className="h-6 w-6" />
                            </Link>
                        </Button>
                         <Button variant="ghost" size="icon" className="md:hidden">
                            <Search className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/messages">
                                <MessageSquare className="h-6 w-6" />
                            </Link>
                        </Button>
                        {user && (
                            <Button variant="ghost" size="icon" onClick={() => setShowCreateForm(true)}>
                                <Plus className="h-6 w-6" />
                            </Button>
                        )}
                        <NotificationsDropdown />
                        <Button variant="ghost" size="icon" asChild>
                           <Link href="/">
                            <Camera className="h-6 w-6" />
                           </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`} alt={user.displayName || ''} />
                                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                                </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
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
                    </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-0 md:px-4 pt-4">
                {showCreateForm && <CreatePostForm onClose={() => setShowCreateForm(false)} />}
                <div className="max-w-xl mx-auto">
                   {postsLoading && <SocialSkeleton />}
                   {!postsLoading && posts && (
                     <>
                        <ReelsTray />
                        <div className="space-y-4 pt-4">
                            {posts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                     </>
                   )}
                </div>
            </main>
        </>
    );
}
