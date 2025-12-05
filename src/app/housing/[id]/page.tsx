

'use client';

import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import type { Housing, UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bed, Home, MapPin, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import SocialSidebar from '@/components/social-sidebar';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getOrCreateConversation } from '@/lib/conversations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import { useMemo } from 'react';
import { getInitials } from '@/lib/avatars';


function HousingDetailPageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <Skeleton className="h-8 w-24 mb-6" />
            <div className="grid md:grid-cols-2 gap-8">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-5 w-1/2" />
                    <div className="pt-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                        <Skeleton className="h-12 w-28" />
                        <Skeleton className="h-12 w-36" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function HousingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const housingId = params.id as string;

    const housingRef = useMemo(() => {
        if (!firestore || !housingId) return null;
        return doc(firestore, 'housings', housingId);
    }, [firestore, housingId]);

    const { data: housing, isLoading } = useDoc<Housing>(housingRef);

    const ownerRef = useMemo(() => {
        if (!firestore || !housing) return null;
        return doc(firestore, 'users', housing.userId);
    }, [firestore, housing]);

    const { data: ownerProfile, isLoading: isOwnerLoading } = useDoc<UserProfile>(ownerRef);

    const handleContact = async () => {
        if (!user || !firestore || !housing) {
            router.push(`/login?from=/housing/${housingId}`);
            return;
        }
        if (user.uid === housing.userId) {
            toast({title: "C'est votre annonce", description: "Vous ne pouvez pas vous contacter vous-même."});
            router.push(`/messages`);
            return;
        }

        const conversationId = await getOrCreateConversation(firestore, user.uid, housing.userId);
        if (conversationId) {
            router.push(`/messages/${conversationId}`);
        } else {
            toast({ title: "Erreur", description: "Impossible de démarrer la conversation", variant: "destructive" });
        }
    }


    return (
        <div className="flex min-h-screen w-full bg-background">
            {user && <SocialSidebar />}
            <div className="flex flex-col flex-1">
                 {user ? (
                    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="flex-1 max-w-md">
                            <GlobalSearch />
                        </div>
                        <div className="flex items-center gap-2">
                            <NotificationsDropdown />
                        </div>
                    </header>
                 ) : (
                    <Navbar />
                 )}

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {isLoading ? <HousingDetailPageSkeleton /> : housing ? (
                        <div className="max-w-5xl mx-auto">
                            <Button variant="ghost" onClick={() => router.push('/housing')} className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Retour aux annonces
                            </Button>
                             <div className="relative aspect-video w-full mb-6 rounded-lg overflow-hidden">
                                <Image src={housing.imageUrl} alt={housing.title} fill className="object-cover" />
                             </div>

                             <div className="grid md:grid-cols-[2fr_1fr] gap-8">
                                <div>
                                    <Badge variant="secondary" className="capitalize">{housing.type}</Badge>
                                    <h1 className="text-3xl font-bold mt-2">{housing.title}</h1>
                                    <p className="text-lg text-muted-foreground mt-1 flex items-center">
                                        <MapPin className="h-5 w-5 mr-2" />
                                        {housing.address}, {housing.city}
                                    </p>
                                    <div className="flex items-center text-md text-muted-foreground gap-6 mt-4 border-t border-b py-4">
                                        <span className="flex items-center gap-2"><Bed className="h-5 w-5"/> {housing.bedrooms} chambre(s)</span>
                                        <span className="flex items-center gap-2"><Home className="h-5 w-5"/> {housing.surfaceArea}m²</span>
                                    </div>
                                    <div className="prose prose-sm dark:prose-invert max-w-none mt-6">
                                        <p>{housing.description}</p>
                                    </div>
                                </div>
                                <div className="row-start-1 md:row-auto">
                                    <div className="sticky top-24 space-y-6">
                                        <div className="border rounded-lg p-6">
                                             <div className="flex flex-col items-center text-center">
                                                <p className="text-4xl font-bold text-primary">{housing.price}€</p>
                                                <p className="text-sm text-muted-foreground -mt-1">/mois</p>
                                            </div>
                                            
                                            <Button size="lg" className="w-full mt-6" onClick={handleContact}>
                                                <MessageSquare className="mr-2 h-5 w-5" />
                                                {user?.uid === housing.userId ? "Vos messages" : "Contacter"}
                                            </Button>
                                        </div>
                                         <Link href={`/profile/${housing.userId}`}>
                                            <div className="border rounded-lg p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                                                 <Avatar>
                                                    <AvatarImage src={ownerProfile?.profilePicture} />
                                                    <AvatarFallback>{getInitials(ownerProfile?.username)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Publié par</p>
                                                    <p className="font-semibold">{ownerProfile?.username || 'Utilisateur'}</p>
                                                </div>
                                            </div>
                                         </Link>
                                    </div>
                                </div>
                             </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <h2 className="text-2xl font-bold">Annonce non trouvée</h2>
                            <p className="text-muted-foreground mt-2">Cette annonce de logement n'existe pas ou a été supprimée.</p>
                            <Button onClick={() => router.push('/housing')} className="mt-6">Retour aux annonces</Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
