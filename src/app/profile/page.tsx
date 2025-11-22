
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3x3, Bookmark, AtSign, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useUser, useAuth, useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import type { Post } from '@/lib/types';
import EditProfileForm from '@/components/edit-profile-form';
import { collection, doc, query, where } from 'firebase/firestore';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';


const ProfileGrid = ({ posts }: { posts: Post[] }) => (
    <div className="grid grid-cols-3 gap-1">
        {posts.map(post => (
            <div key={post.id} className="relative aspect-square bg-muted">
                {post.imageUrl && (
                    <Image 
                        src={post.imageUrl}
                        alt="User post"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 25vw"
                    />
                )}
            </div>
        ))}
    </div>
);

function ProfilePageSkeleton() {
    return (
        <div className="mx-auto max-w-4xl">
            <div className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
                    <Skeleton className="h-24 w-24 md:h-36 md:w-36 rounded-full flex-shrink-0" />
                    <div className="space-y-3 text-center sm:text-left">
                        <Skeleton className="h-6 w-40 mx-auto sm:mx-0" />
                        <div className="flex justify-center sm:justify-start gap-4">
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-4 w-20" />
                           <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-4 w-48 pt-2 mx-auto sm:mx-0" />
                    </div>
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
        </div>
    );
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const { auth, firestore } = useAuth();
  const router = useRouter();

  const [showEditForm, setShowEditForm] = useState(false);

  const userRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: profileLoading } = useDoc(userRef);

  const userPostsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'posts'), where('userId', '==', user.uid));
  }, [firestore, user]);
  const { data: userPosts, isLoading: postsLoading } = useCollection<Post>(userPostsQuery);


  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login?from=/profile');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    if(auth) {
        await signOut(auth);
        router.push('/');
    }
  }
  
  const getInitials = (email?: string | null) => {
    if (!email) return '..';
    const parts = email.split('@')[0].replace('.', ' ').split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  }

  const loading = isUserLoading || postsLoading || profileLoading;


  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background text-primary-foreground">
              <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-4xl font-bold text-foreground">Mon Profil</h1>
                  <p className="mt-2 text-lg text-muted-foreground">Gérez vos informations personnelles</p>
              </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            {loading || !user || !userProfile ? <ProfilePageSkeleton /> : (
                <div className="mx-auto max-w-4xl">
                    <div className="p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
                             <Avatar className="h-24 w-24 md:h-36 md:w-36 flex-shrink-0">
                                <AvatarImage src={user.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`} />
                                <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-4 text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <h2 className="text-2xl font-light">{userProfile?.username || user.email?.split('@')[0]}</h2>
                                    <div className="flex items-center gap-2">
                                        <Button variant="secondary" size="sm" onClick={() => setShowEditForm(true)}>Modifier le profil</Button>
                                        <Button variant="ghost" size="sm" onClick={handleLogout}>
                                            <LogOut className="h-4 w-4"/>
                                            <span className="ml-2 hidden sm:inline">Déconnexion</span>
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex justify-center sm:justify-start gap-4 md:gap-8 text-sm">
                                    <p><span className="font-semibold">{userPosts?.length || 0}</span> publications</p>
                                    <p><span className="font-semibold">1.2k</span> abonnés</p>
                                    <p><span className="font-semibold">543</span> abonnements</p>
                                </div>
                                <div>
                                    <p className="font-semibold">{userProfile?.firstName} {userProfile?.lastName}</p>
                                    <p className="text-muted-foreground text-sm">{userProfile?.university || 'Université non spécifiée'}</p>
                                     <p className="text-sm mt-1">{userProfile?.bio}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showEditForm && userProfile && (
                        <EditProfileForm 
                            user={user}
                            userProfile={userProfile}
                            onClose={() => setShowEditForm(false)}
                        />
                    )}


                    <Tabs defaultValue="posts" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 rounded-none border-y">
                            <TabsTrigger value="posts" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                                <Grid3x3 className="h-5 w-5" />
                                <span className="hidden md:inline ml-2">Publications</span>
                            </TabsTrigger>
                            <TabsTrigger value="saved" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                                <Bookmark className="h-5 w-5" />
                                <span className="hidden md:inline ml-2">Enregistrés</span>
                            </TabsTrigger>
                            <TabsTrigger value="tagged" className="rounded-none shadow-none data-[state=active]:border-t-2 border-primary data-[state=active]:shadow-none -mt-px">
                                <AtSign className="h-5 w-5" />
                                <span className="hidden md:inline ml-2">Mentions</span>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="posts">
                            {userPosts && userPosts.length > 0 ? <ProfileGrid posts={userPosts} /> : (
                                <div className="text-center p-10">
                                    <h3 className="text-lg font-semibold">Aucune publication</h3>
                                    <p className="text-muted-foreground text-sm">Vos publications apparaîtront ici.</p>
                                </div>
                            )}
                        </TabsContent>
                        <TabsContent value="saved">
                             <div className="text-center p-10">
                                <h3 className="text-lg font-semibold">Aucun enregistrement</h3>
                                <p className="text-muted-foreground text-sm">Les publications que vous enregistrez apparaîtront ici.</p>
                            </div>
                        </TabsContent>
                        <TabsContent value="tagged">
                            <div className="text-center p-10">
                                <h3 className="text-lg font-semibold">Photos de vous</h3>
                                <p className="text-muted-foreground text-sm">Lorsque des personnes vous mentionnent dans des photos, elles apparaissent ici.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
          </div>
        </main>
        <Footer />
    </div>
  );
}
