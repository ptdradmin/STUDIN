
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import PostCard from "@/components/post-card";
import { getPosts, Post } from "@/lib/mock-data";
import { Camera, Compass, Heart, Home, MessageSquare, Search } from 'lucide-react';
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
import { User, LogOut, Settings } from "lucide-react";
import { Input } from './ui/input';


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


export default function SocialClientPage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isPostsLoading, setIsPostsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?from=/social');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            getPosts().then(data => {
                setPosts(data);
                setIsPostsLoading(false);
            });
        }
    }, [user]);

    if (loading || !user || isPostsLoading) {
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
                            <Link href="/">
                                <Home className="h-6 w-6" />
                            </Link>
                        </Button>
                         <Button variant="ghost" size="icon" className="md:hidden">
                            <Search className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <MessageSquare className="h-6 w-6" />
                        </Button>
                         <Button variant="ghost" size="icon">
                            <Compass className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Heart className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Camera className="h-6 w-6" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`} alt={user.first_name} />
                                    <AvatarFallback>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.first_name} {user.last_name}</p>
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
                                <DropdownMenuItem onClick={logout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Déconnexion</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-0 md:px-4 py-4">
                <div className="max-w-xl mx-auto">
                    <div className="space-y-4">
                        {posts.map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}
