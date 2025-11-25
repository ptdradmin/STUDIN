
'use client';

import Image from "next/image";
import type { Housing } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Home, MapPin, MoreHorizontal, User as UserIcon } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getOrCreateConversation } from "@/lib/conversations";

interface HousingCardProps {
    housing: Housing;
    onEdit: (housing: Housing) => void;
    onClick: (housing: Housing) => void;
}

export default function HousingCard({ housing, onEdit, onClick }: HousingCardProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    
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
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
            const housingRef = doc(firestore, "housings", housing.id);
            deleteDocumentNonBlocking(housingRef);
            toast({ title: "Succès", description: "Annonce supprimée." });
        }
    };

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent click event from firing when interacting with dropdown or contact button
        const target = e.target as HTMLElement;
        if (target.closest('[data-radix-dropdown-menu-trigger]') || target.closest('button')) {
            return;
        }
        onClick(housing);
    }
    
    const handleContact = async () => {
        if (!user || !firestore) {
            router.push('/login?from=/housing');
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
        <Card onClick={handleCardClick} className="overflow-hidden shadow-md transition-shadow hover:shadow-xl flex flex-col h-full cursor-pointer">
            <div className="relative">
                <Image
                    src={housing.imageUrl}
                    alt={housing.title}
                    width={600}
                    height={400}
                    className="aspect-[3/2] w-full object-cover"
                    data-ai-hint={housing.imageHint}
                />
                <Badge variant="secondary" className="absolute top-2 right-2 capitalize bg-white/80 text-foreground hover:bg-white">
                    {housing.type}
                </Badge>
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
                                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                                    Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>
            <CardContent className="p-4 flex flex-col flex-grow">
                 <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={housing.ownerAvatarUrl} alt={housing.ownerUsername} />
                        <AvatarFallback>{getInitials(housing.ownerUsername)}</AvatarFallback>
                    </Avatar>
                    <span>{housing.ownerUsername}</span>
                 </div>
                <h3 className="text-lg font-semibold leading-tight truncate mt-2">{housing.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    {housing.city}
                </p>
                
                <div className="flex items-center text-sm text-muted-foreground gap-4 mt-3">
                    <span className="flex items-center"><Bed className="h-4 w-4 mr-1"/> {housing.bedrooms} ch.</span>
                    <span className="flex items-center"><Home className="h-4 w-4 mr-1"/> {housing.surface_area}m²</span>
                </div>

                <div className="flex items-end justify-between mt-auto pt-4 border-t mt-4">
                    <div>
                        <p className="text-2xl font-bold text-primary">{housing.price}€</p>
                        <p className="text-xs text-muted-foreground -mt-1">/mois</p>
                    </div>
                    {user && (
                         <Button onClick={handleContact} disabled={isOwner}>
                            {isOwner ? "Votre annonce" : "Contacter"}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

    
