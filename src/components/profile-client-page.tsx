
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Bookmark, AtSign, LogOut } from 'lucide-react';
import Image from 'next/image';
import { getPosts, Post } from '@/lib/mock-data';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';

const ProfileGrid = ({ posts }: { posts: Post[] }) => (
    <div className="grid grid-cols-3 gap-1">
        {posts.map(post => (
            <div key={post.id} className="relative aspect-square">
                <Image 
                    src={post.imageUrl}
                    alt="User post"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 33vw, 25vw"
                />
            </div>
        ))}
    </div>
);


export default function ProfileClientPage() {
  const { user, loading } = useUser();
  const { auth } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?from=/profile');
    }
  }, [user, loading, router]);

   useEffect(() => {
    if (user) {
      getPosts().then(data => {
        setPosts(data);
      });
    }
  }, [user]);

  const handleLogout = async () => {
    if(auth) {
        await signOut(auth);
        router.push('/');
    }
  }
  
  const getInitials = (email?: string | null) => {
    if (!email) return '..';
    const parts = email.split('@')[0].replace('.', ' ').split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  if (loading || !user) {
    return (
        <Card className="mx-auto max-w-4xl shadow-none border-0">
            <CardContent className="p-4 md:p-6">
                <div className="flex items-center space-x-4 md:space-x-8">
                    <Skeleton className="h-20 w-20 md:h-36 md:w-36 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <div className="flex gap-4">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-48 pt-2" />
                    </div>
                </div>
                 <div className="mt-8">
                    <Skeleton className="h-10 w-full" />
                     <div className="grid grid-cols-3 gap-1 mt-1">
                        <Skeleton className="aspect-square" />
                        <Skeleton className="aspect-square" />
                        <Skeleton className="aspect-square" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
  }

  const userPosts = posts.filter(p => p.user.name.toLowerCase().includes('alice')); // Mocking posts by current user

  return (
    <div className="mx-auto max-w-4xl">
        <div className="p-4 md:p-6">
            <div className="flex items-center space-x-4 md:space-x-8">
                 <Avatar className="h-20 w-20 md:h-36 md:w-36">
                    <AvatarImage src={user.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`} />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                </Avatar>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-light">{user.displayName || user.email?.split('@')[0]}</h2>
                        <Button onClick={handleLogout} variant="destructive" size="sm" className="md:hidden">
                            <LogOut className="h-4 w-4"/>
                        </Button>
                    </div>
                    <div className="flex gap-4 md:gap-8 text-sm">
                        <p><span className="font-semibold">{userPosts.length}</span> publications</p>
                        <p><span className="font-semibold">1.2k</span> abonnés</p>
                        <p><span className="font-semibold">543</span> abonnements</p>
                    </div>
                    <div>
                        <p className="font-semibold">{user.displayName || "Utilisateur"}</p>
                        {/* <p className="text-muted-foreground text-sm">{user.university || 'Université non spécifiée'}</p> */}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex gap-2">
                <Button variant="secondary" className="flex-grow">Modifier le profil</Button>
                <Button variant="secondary" className="flex-grow">Partager le profil</Button>
                 <Button onClick={handleLogout} variant="destructive" className="shrink-0 hidden md:flex">
                    Déconnexion
                </Button>
            </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-y">
                <TabsTrigger value="posts" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                    <Grid3x3 className="h-5 w-5" />
                    <span className="hidden md:inline ml-2">Publications</span>
                </TabsTrigger>
                <TabsTrigger value="saved" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                    <Bookmark className="h-5 w-5" />
                    <span className="hidden md:inline ml-2">Enregistrements</span>
                </TabsTrigger>
                <TabsTrigger value="tagged" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                    <AtSign className="h-5 w-5" />
                    <span className="hidden md:inline ml-2">Mentions</span>
                </TabsTrigger>
            </TabsList>
            <TabsContent value="posts">
                {userPosts.length > 0 ? <ProfileGrid posts={userPosts} /> : (
                    <div className="text-center p-10">
                        <h3 className="text-lg font-semibold">Aucune publication</h3>
                        <p className="text-muted-foreground text-sm">Vos publications apparaîtront ici.</p>
                    </div>
                )}
            </TabsContent>
            <TabsContent value="saved">
                 {posts.slice(0,2).length > 0 ? <ProfileGrid posts={posts.slice(0, 2)} /> : (
                     <div className="text-center p-10">
                        <h3 className="text-lg font-semibold">Aucun enregistrement</h3>
                        <p className="text-muted-foreground text-sm">Les publications que vous enregistrez apparaîtront ici.</p>
                    </div>
                 )}
            </TabsContent>
            <TabsContent value="tagged">
                <div className="text-center p-10">
                    <h3 className="text-lg font-semibold">Photos de vous</h3>
                    <p className="text-muted-foreground text-sm">Lorsque des personnes vous mentionnent dans des photos, elles apparaissent ici.</p>
                </div>
            </TabsContent>
        </Tabs>
    </div>
  );
}
