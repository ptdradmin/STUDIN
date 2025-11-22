
'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import type { User as FirebaseUser } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  university: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

const universities = [
    'Université de Namur',
    'Université de Liège',
    'UCLouvain',
    'ULB - Université Libre de Bruxelles',
    'UMons',
    'HEC Liège',
    'Autre'
];


interface EditProfileFormProps {
  user: FirebaseUser;
  userProfile: any;
  onClose: () => void;
}

export default function EditProfileForm({ user, userProfile, onClose }: EditProfileFormProps) {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        university: userProfile?.university || '',
        fieldOfStudy: userProfile?.fieldOfStudy || '',
        bio: userProfile?.bio || ''
    }
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }
    setLoading(true);
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: new Date()
      });
      
      const displayName = `${data.firstName} ${data.lastName}`;
      if(user.displayName !== displayName) {
        await updateProfile(user, { displayName });
      }

      toast({ title: 'Succès', description: 'Profil mis à jour !' });
      onClose();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de mettre à jour le profil." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" {...register('bio')} placeholder="Parlez un peu de vous..." />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>

            <div>
              <Label htmlFor="university">Université</Label>
               <Select name="university" onValueChange={(value) => reset({ ...userProfile, university: value })} defaultValue={userProfile.university}>
                  <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre université" />
                  </SelectTrigger>
                  <SelectContent>
                      {universities.map(uni => (
                          <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
               {errors.university && <p className="text-xs text-destructive">{errors.university.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="fieldOfStudy">Domaine d'études</Label>
              <Input id="fieldOfStudy" {...register('fieldOfStudy')} />
              {errors.fieldOfStudy && <p className="text-xs text-destructive">{errors.fieldOfStudy.message}</p>}
            </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
