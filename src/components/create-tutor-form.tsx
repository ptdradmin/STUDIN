'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FirestorePermissionError, errorEmitter } from '@/firebase';

const tutorSchema = z.object({
  subject: z.string().min(1, 'La matière est requise'),
  level: z.string().min(1, 'Le niveau est requis'),
  pricePerHour: z.preprocess((val) => Number(val), z.number().min(0, 'Le prix est requis')),
  locationType: z.enum(['online', 'in-person', 'both'], { required_error: 'Le type de lieu est requis' }),
  description: z.string().min(1, 'Une description est requise'),
});

type TutorFormInputs = z.infer<typeof tutorSchema>;

interface CreateTutorFormProps {
  onClose: () => void;
}

export default function CreateTutorForm({ onClose }: CreateTutorFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<TutorFormInputs>({
    resolver: zodResolver(tutorSchema),
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const onSubmit: SubmitHandler<TutorFormInputs> = async (data) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }
    setLoading(true);
    
    try {
        const tutorData = {
            ...data,
            tutorId: user.uid,
            tutorUsername: user.displayName || user.email?.split('@')[0],
            tutorAvatarUrl: user.photoURL,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            rating: 0,
            coordinates: [50.8503, 4.3517] // Default to Brussels, TODO: Geocode user's location
        };

        addDocumentNonBlocking(collection(firestore, 'tutorings'), tutorData);
        
        toast({ title: 'Succès', description: 'Votre profil de tuteur a été créé !' });
        onClose();
    } catch (error) {
        if (!(error instanceof FirestorePermissionError)) {
            console.error("Erreur de création de profil de tuteur:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de créer le profil.' });
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Devenir Tuteur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
          <div>
            <Label htmlFor="subject">Matière enseignée</Label>
            <Input id="subject" {...register('subject')} placeholder="Ex: Mathématiques, Droit constitutionnel..." />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <Label htmlFor="level">Niveau</Label>
               <Input id="level" {...register('level')} placeholder="Ex: Bachelier 1" />
              {errors.level && <p className="text-xs text-destructive">{errors.level.message}</p>}
            </div>
            <div>
              <Label htmlFor="pricePerHour">Tarif horaire (€)</Label>
              <Input id="pricePerHour" type="number" {...register('pricePerHour')} />
              {errors.pricePerHour && <p className="text-xs text-destructive">{errors.pricePerHour.message}</p>}
            </div>
          </div>
           <div>
            <Label htmlFor="locationType">Lieu des cours</Label>
            <Controller
                name="locationType"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner le lieu" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="online">En ligne</SelectItem>
                            <SelectItem value="in-person">En personne</SelectItem>
                            <SelectItem value="both">Les deux</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.locationType && <p className="text-xs text-destructive">{errors.locationType.message}</p>}
          </div>
           <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} placeholder="Décrivez votre méthode d'enseignement, votre expérience..." />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le profil'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
