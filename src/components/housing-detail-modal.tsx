
'use client';

import Image from 'next/image';
import type { Housing } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bed, Home, MapPin } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase';
import { useRouter } from 'next/navigation';
import { getOrCreateConversation } from '@/lib/conversations';
import { useToast } from '@/hooks/use-toast';

interface HousingDetailModalProps {
  housing: Housing;
  onClose: () => void;
}

export default function HousingDetailModal({ housing, onClose }: HousingDetailModalProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const handleContact = async () => {
      if (!user || !firestore) {
          router.push('/login?from=/housing');
          return;
      }
      if (user.uid === housing.userId) {
          toast({ title: "C'est votre annonce", description: "Vous ne pouvez pas vous contacter vous-même."});
          return;
      }

      const conversationId = await getOrCreateConversation(firestore, user.uid, housing.userId);
      if (conversationId) {
          router.push(`/messages/${conversationId}`);
          onClose();
      } else {
          toast({ title: "Erreur", description: "Impossible de démarrer la conversation", variant: "destructive" });
      }
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="relative h-64 w-full">
            <Image
                src={housing.imageUrl}
                alt={housing.title}
                fill
                className="object-cover rounded-t-lg"
                data-ai-hint={housing.imageHint}
            />
             <Badge variant="secondary" className="absolute top-2 right-2 capitalize bg-white/80 text-foreground hover:bg-white">
                {housing.type}
            </Badge>
        </div>
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl">{housing.title}</DialogTitle>
          <DialogDescription className="flex items-center pt-1">
             <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
             {housing.address}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 space-y-4">
             <p className="text-sm text-muted-foreground">{housing.description}</p>
             <div className="flex items-center text-sm text-muted-foreground gap-4 pt-2">
                <span className="flex items-center"><Bed className="h-4 w-4 mr-1"/> {housing.bedrooms} chambre(s)</span>
                <span className="flex items-center"><Home className="h-4 w-4 mr-1"/> {housing.surface_area}m²</span>
            </div>
        </div>
        <DialogFooter className="p-6 flex-row justify-between items-center bg-muted/50 rounded-b-lg">
             <div>
                <p className="text-3xl font-bold text-primary">{housing.price}€</p>
                <p className="text-sm text-muted-foreground -mt-1">/mois</p>
            </div>
          <Button size="lg" onClick={handleContact}>Contacter le propriétaire</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
