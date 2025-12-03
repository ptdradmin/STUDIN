

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
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { staticChallenges } from '@/lib/static-data';

const FormSection = ({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
        <div className="md:col-span-1">
            <h3 className="font-semibold text-base">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="md:col-span-2 space-y-4">
            {children}
        </div>
    </div>
);


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
  const { user, isUserLoading } = useAuth();
  const firestore = useFirestore();

  const onSubmit: SubmitHandler<TutorFormInputs> = (data) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }
    setLoading(true);
    toast({ title: 'Création...', description: 'Votre profil de tuteur est en cours de création.' });
    
    const tutoringsCollection = collection(firestore, 'tutorings');
    const newDocRef = doc(tutoringsCollection);

    const baseChallenge = staticChallenges[Math.floor(Math.random() * staticChallenges.length)];
    const newCoords: [number, number] = [
        (baseChallenge.latitude || 50.46) + (Math.random() - 0.5) * 0.05,
        (baseChallenge.longitude || 4.87) + (Math.random() - 0.5) * 0.05,
    ];

    const tutorData = {
        ...data,
        id: newDocRef.id,
        tutorId: user.uid,
        username: user.displayName?.split(' ')[0] || user.email?.split('@')[0],
        userAvatarUrl: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        rating: 0,
        totalReviews: 0,
        coordinates: newCoords,
    };

    setDocumentNonBlocking(newDocRef, tutorData);
    
    toast({ title: 'Succès', description: 'Votre profil de tuteur a été créé !' });
    onClose();
    setLoading(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Devenir Tuteur</DialogTitle>
           <DialogDescription>
            Partagez vos connaissances et aidez d'autres étudiants à réussir.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
          <FormSection title="Matière" description="Quelle matière souhaitez-vous enseigner ?">
             <div>
                <Label htmlFor="subject" className="sr-only">Matière enseignée</Label>
                <Input id="subject" {...register('subject')} placeholder="Ex: Mathématiques, Droit constitutionnel..." />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
            </div>
          </FormSection>

          <FormSection title="Niveau" description="À quel niveau d'études vous adressez-vous ?">
            <div>
              <Label htmlFor="level" className="sr-only">Niveau</Label>
               <Input id="level" {...register('level')} placeholder="Ex: Bachelier 1, Secondaire, Master..." />
              {errors.level && <p className="text-xs text-destructive">{errors.level.message}</p>}
            </div>
          </FormSection>

           <FormSection title="Tarif et Lieu" description="Fixez votre prix et où vous donnez cours.">
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricePerHour">Tarif horaire (€)</Label>
                  <Input id="pricePerHour" type="number" {...register('pricePerHour')} />
                  {errors.pricePerHour && <p className="text-xs text-destructive">{errors.pricePerHour.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="locationType">Lieu des cours</Label>
                    <Controller
                        name="locationType"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
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
              </div>
          </FormSection>

          <FormSection title="Description" description="Présentez-vous et décrivez votre méthode de travail.">
            <div>
                <Label htmlFor="description" className="sr-only">Description</Label>
                <Textarea id="description" {...register('description')} placeholder="Décrivez votre méthode d'enseignement, votre expérience..." className="min-h-[100px]" />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
          </FormSection>

          <DialogFooter className="sticky bottom-0 bg-background pt-4 -m-1 -mb-4 p-6 border-t">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || isUserLoading}>
              {loading ? 'Création...' : 'Créer le profil'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
