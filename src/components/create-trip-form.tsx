
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

const tripSchema = z.object({
  departureCity: z.string().min(1, 'La ville de départ est requise'),
  arrivalCity: z.string().min(1, "La ville d'arrivée est requise"),
  departureTime: z.string().min(1, 'L\'heure de départ est requise'),
  seatsAvailable: z.preprocess((val) => Number(val), z.number().min(1, 'Le nombre de sièges est requis')),
  pricePerSeat: z.preprocess((val) => Number(val), z.number().min(0, 'Le prix est requis')),
  description: z.string().optional(),
});

type TripFormInputs = z.infer<typeof tripSchema>;

interface CreateTripFormProps {
  onClose: () => void;
}

export default function CreateTripForm({ onClose }: CreateTripFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<TripFormInputs>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      seatsAvailable: 1,
      pricePerSeat: 5,
    }
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useAuth();
  const firestore = useFirestore();

  const onSubmit: SubmitHandler<TripFormInputs> = async (data) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour proposer un trajet.' });
      return;
    }
    setLoading(true);

    try {
        const carpoolingsCollection = collection(firestore, 'carpoolings');
        const newDocRef = doc(carpoolingsCollection);

        const tripData = {
            ...data,
            id: newDocRef.id,
            driverId: user.uid,
            username: user.displayName?.split(' ')[0] || user.email?.split('@')[0],
            userAvatarUrl: user.photoURL,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            departureAddress: data.departureCity, // simplified
            arrivalAddress: data.arrivalCity, // simplified
            coordinates: [50.4674, 4.8720] // Default to Namur, TODO: Geocode
        };
        
        setDocumentNonBlocking(newDocRef, tripData, {});

        toast({ title: 'Succès', description: 'Trajet proposé avec succès !' });
        onClose();
    } catch(error: any) {
        if (!(error instanceof FirestorePermissionError)) {
            const contextualError = new FirestorePermissionError({
                path: 'carpoolings',
                operation: 'create',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', contextualError);
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proposer un trajet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="departureCity">Départ</Label>
              <Input id="departureCity" {...register('departureCity')} />
              {errors.departureCity && <p className="text-xs text-destructive">{errors.departureCity.message}</p>}
            </div>
            <div>
              <Label htmlFor="arrivalCity">Arrivée</Label>
              <Input id="arrivalCity" {...register('arrivalCity')} />
              {errors.arrivalCity && <p className="text-xs text-destructive">{errors.arrivalCity.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="departureTime">Date et heure de départ</Label>
            <Input id="departureTime" type="datetime-local" {...register('departureTime')} />
            {errors.departureTime && <p className="text-xs text-destructive">{errors.departureTime.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seatsAvailable">Places disponibles</Label>
              <Input id="seatsAvailable" type="number" {...register('seatsAvailable')} />
              {errors.seatsAvailable && <p className="text-xs text-destructive">{errors.seatsAvailable.message}</p>}
            </div>
            <div>
              <Label htmlFor="pricePerSeat">Prix par place (€)</Label>
              <Input id="pricePerSeat" type="number" {...register('pricePerSeat')} />
              {errors.pricePerSeat && <p className="text-xs text-destructive">{errors.pricePerSeat.message}</p>}
            </div>
          </div>
           <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea id="description" {...register('description')} placeholder="Ex: Voyage tranquille, musique bienvenue..."/>
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || isUserLoading}>
              {loading ? 'Création...' : 'Proposer le trajet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
