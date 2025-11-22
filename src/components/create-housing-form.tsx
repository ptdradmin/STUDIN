
'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Housing } from '@/lib/types';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const housingSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  type: z.enum(['kot', 'studio', 'colocation'], { required_error: 'Le type est requis' }),
  price: z.preprocess((val) => Number(val), z.number().min(1, 'Le prix est requis')),
  address: z.string().min(1, "L'adresse est requise"),
  city: z.string().min(1, 'La ville est requise'),
  bedrooms: z.preprocess((val) => Number(val), z.number().min(1, 'Le nombre de chambres est requis')),
  surface_area: z.preprocess((val) => Number(val), z.number().min(1, 'La surface est requise')),
  imageUrl: z.string().url('URL invalide').min(1, "L'URL de l'image est requise"),
});

type HousingFormInputs = z.infer<typeof housingSchema>;

interface CreateHousingFormProps {
  onClose: () => void;
  housingToEdit?: Housing | null;
}

export default function CreateHousingForm({ onClose, housingToEdit }: CreateHousingFormProps) {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<HousingFormInputs>({
    resolver: zodResolver(housingSchema),
  });
  
  useEffect(() => {
    if (housingToEdit) {
      reset(housingToEdit);
    } else {
      reset({
        title: '',
        description: '',
        price: 0,
        address: '',
        city: '',
        bedrooms: 1,
        surface_area: 0,
        imageUrl: '',
        type: undefined
      });
    }
  }, [housingToEdit, reset]);

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();
  const isEditing = !!housingToEdit;

  const onSubmit: SubmitHandler<HousingFormInputs> = async (data) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour poster.' });
      return;
    }
    setLoading(true);
    
    try {
      if (isEditing) {
        if (!housingToEdit) return;
        const housingRef = doc(firestore, 'housings', housingToEdit.id);
        const dataToUpdate = { ...data, updatedAt: serverTimestamp() };
        updateDocumentNonBlocking(housingRef, dataToUpdate);
        toast({ title: 'Succès', description: 'Annonce de logement mise à jour !' });
      } else {
        const dataToCreate = {
          ...data,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          coordinates: [50.8503, 4.3517], // TODO: Geocode address
          imageHint: "student room"
        };
        addDocumentNonBlocking(collection(firestore, 'housings'), dataToCreate);
        toast({ title: 'Succès', description: 'Annonce de logement créée !' });
      }
      onClose();
    } catch (error) {
      console.error(error);
      const contextualError = new FirestorePermissionError({
        path: isEditing && housingToEdit ? `housings/${housingToEdit.id}` : 'housings',
        operation: isEditing ? 'update' : 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', contextualError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier' : 'Créer'} une annonce de logement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
           <div>
                <Label htmlFor="type">Type</Label>
                <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kot">Kot</SelectItem>
                                <SelectItem value="studio">Studio</SelectItem>
                                <SelectItem value="colocation">Colocation</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Prix (€/mois)</Label>
              <Input id="price" type="number" {...register('price')} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
             <div>
              <Label htmlFor="surface_area">Surface (m²)</Label>
              <Input id="surface_area" type="number" {...register('surface_area')} />
              {errors.surface_area && <p className="text-xs text-destructive">{errors.surface_area.message}</p>}
            </div>
          </div>
           <div>
              <Label htmlFor="bedrooms">Chambres</Label>
              <Input id="bedrooms" type="number" {...register('bedrooms')} />
              {errors.bedrooms && <p className="text-xs text-destructive">{errors.bedrooms.message}</p>}
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" {...register('address')} />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input id="city" {...register('city')} />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
           <div>
            <Label htmlFor="imageUrl">URL de l'image</Label>
            <Input id="imageUrl" placeholder="https://picsum.photos/..." {...register('imageUrl')} />
            {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? (isEditing ? 'Mise à jour...' : 'Création...') : (isEditing ? 'Mettre à jour' : 'Créer')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
