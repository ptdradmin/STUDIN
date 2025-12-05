
'use client';

import Image from "next/image";
import type { Housing, Favorite } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Home, MapPin, MoreHorizontal, User as UserIcon, Bookmark, MessageSquare } from "lucide-react";
import { useUser, useFirestore, deleteDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getOrCreateConversation } from "@/lib/conversations";
import { toggleFavorite } from "@/lib/actions";
import { useState, useEffect } from "react";
import Link from 'next/link';

interface HousingCardProps {
    housing: Housing;
    onEdit: (housing: Housing) => void;
    isFavorited?: boolean;
    onClick?: () => void;
}

export default function HousingCard({ housing, onEdit, isFavorited = false, onClick }: HousingCardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const [isSaved, setIsSaved] = useState(isFavorited);

    useEffect(() => {
        setIsSaved(isFavorited);
    }, [isFavorited]);
    
    const isOwner = user && user.uid === housing.userId;

    const getInitials = (name?: string) => {
        if (!name) return "..";
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    const handleDelete = async () => {
        if (!firestore || !isOwner) return;
        const housingRef = doc(firestore, "housings", housing.id);
        deleteDocumentNonBlocking(housingRef);
        toast({ title: "Succès", description: "Annonce supprimée." });
    };

    const handleCardClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, [role="menu"], [role="dialog"]')) {
            return;
        }
        if (onClick) {
          onClick();
        } else {
          router.push(`/housing/${housing.id}`);
        }
    }
    
    const handleContact = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || !firestore) {
            router.push(`/login?from=/housing/${housing.id}`);
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

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user || !firestore) {
            router.push('/login?from=/housing');
            return;
        }
        const wasSaved = isSaved;
        setIsSaved(!wasSaved); 
        try {
            await toggleFavorite(firestore, user.uid, { id: housing.id, type: 'housing' }, wasSaved);
            toast({ title: wasSaved ? 'Retiré des favoris' : 'Ajouté aux favoris' });
        } catch (error) {
            setIsSaved(wasSaved); // Revert on error
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de mettre à jour les favoris.' });
        }
    };


    return (
        <Card onClick={handleCardClick} className="overflow-hidden shadow-md transition-shadow hover:shadow-xl flex flex-col h-full cursor-pointer group">
            <div className="relative aspect-[4/3] w-full bg-muted">
                {housing.imageUrl ? (
                     <Image src={housing.imageUrl || '/placeholder.svg'} alt={housing.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" data-ai-hint={housing.imageHint} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <Bed className="h-12 w-12 text-muted-foreground" />
                    </div>
                )}
                <Badge variant="secondary" className="absolute top-2 right-2 capitalize bg-white/80 text-foreground hover:bg-white">
                    {housing.type}
                </Badge>
                
                 {user && !isOwner && (
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full absolute top-2 left-2" onClick={handleFavoriteClick}>
                        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                    </Button>
                )}

                 {isOwner && (
                    <div className="absolute top-1 left-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onEdit(housing)}>Modifier</DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                            Supprimer
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Cette action est irréversible et supprimera définitivement votre annonce.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
            <CardContent className="p-4 flex flex-col flex-grow">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={housing.userAvatarUrl} alt={housing.username} />
                        <AvatarFallback>{getInitials(housing.username)}</AvatarFallback>
                    </Avatar>
                    <span>{housing.username}</span>
                 </div>
                <h3 className="text-lg font-semibold leading-tight truncate mt-2">{housing.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    {housing.city}
                </p>
                
                <div className="flex items-center text-sm text-muted-foreground gap-4 mt-3">
                    <span className="flex items-center"><Bed className="h-4 w-4 mr-1"/> {housing.bedrooms} ch.</span>
                    <span className="flex items-center"><Home className="h-4 w-4 mr-1"/> {housing.surfaceArea}m²</span>
                </div>

                <div className="flex items-end justify-between mt-auto pt-4 border-t mt-4">
                    <div>
                        <p className="text-2xl font-bold text-primary">{housing.price}€</p>
                        <p className="text-xs text-muted-foreground -mt-1">/mois</p>
                    </div>
                    {user && !isOwner ? (
                         <Button onClick={handleContact}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contacter
                        </Button>
                    ) : !user ? (
                        <Button onClick={(e) => { e.stopPropagation(); router.push(`/login?from=/housing/${housing.id}`)}}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Contacter
                        </Button>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
