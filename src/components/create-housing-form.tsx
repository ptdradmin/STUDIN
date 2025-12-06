

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
import { useAuth, useFirestore, useStorage, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, serverTimestamp, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Housing } from '@/lib/types';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import { staticChallenges } from '@/lib/static-data';
import FormSection from './form-section';


const housingSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  type: z.enum(['kot', 'studio', 'colocation'], { required_error: 'Le type est requis' }),
  price: z.preprocess((val) => Number(val), z.number().min(1, 'Le prix est requis')),
  address: z.string().min(1, "L'adresse est requise"),
  city: z.string().min(1, 'La ville est requise'),
  bedrooms: z.preprocess((val) => Number(val), z.number().min(1, 'Le nombre de chambres est requis')),
  surfaceArea: z.preprocess((val) => Number(val), z.number().min(1, 'La surface est requise')),
});

type HousingFormInputs = z.infer<typeof housingSchema>;

interface CreateHousingFormProps {
  onClose: () => void;
  housingToEdit?: Housing | null;
}


export default function CreateHousingForm({ onClose, housingToEdit }: CreateHousingFormProps) {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<HousingFormInputs>({
    resolver: zodResolver(housingSchema),
    defaultValues: housingToEdit ? {
      title: housingToEdit.title,
      description: housingToEdit.description,
      type: housingToEdit.type,
      price: housingToEdit.price,
      address: housingToEdit.address,
      city: housingToEdit.city,
      bedrooms: housingToEdit.bedrooms,
      surfaceArea: housingToEdit.surfaceArea,
    } : undefined
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const isEditing = !!housingToEdit;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(housingToEdit?.imageUrl || null);


  useEffect(() => {
    if (housingToEdit) {
      reset({
        ...housingToEdit,
        surfaceArea: housingToEdit.surfaceArea,
      });
      setPreviewUrl(housingToEdit.imageUrl);
    }
  }, [housingToEdit, reset]);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit: SubmitHandler<HousingFormInputs> = async (data) => {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour poster.' });
      return;
    }
    if (!previewUrl) {
      toast({ variant: 'destructive', title: 'Erreur', description: "L'image est requise." });
      return;
    }

    setLoading(true);

    const housingId = housingToEdit?.id || doc(collection(firestore, 'housings')).id;
    const housingRef = doc(firestore, 'housings', housingId);

    const baseChallenge = staticChallenges[Math.floor(Math.random() * staticChallenges.length)];
    const newCoords: [number, number] = [
      (baseChallenge.latitude || 50.46) + (Math.random() - 0.5) * 0.05,
      (baseChallenge.longitude || 4.87) + (Math.random() - 0.5) * 0.05,
    ];

    try {
      let imageUrl = housingToEdit?.imageUrl || '';
      if (imageFile) {
        const imageRef = storageRef(storage, `housings/${housingId}/${imageFile.name}`);
        await uploadBytesResumable(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (isEditing) {
        const dataToUpdate = { ...data, surfaceArea: data.surfaceArea, updatedAt: serverTimestamp(), imageUrl, coordinates: newCoords };
        await updateDoc(housingRef, dataToUpdate);
        toast({ title: 'Annonce mise à jour !' });
      } else {
        const dataToCreate: Omit<Housing, 'userId'> & { userId: string } = {
          ...data,
          surfaceArea: data.surfaceArea,
          id: housingId,
          userId: user.uid,
          username: user.displayName || '',
          createdAt: serverTimestamp() as any,
          updatedAt: serverTimestamp() as any,
          coordinates: newCoords,
          imageHint: "student room",
          imageUrl,
        };
        await setDoc(housingRef, dataToCreate);
        toast({ title: 'Annonce créée !' });
      }
      onClose();
    } catch (error) {
      console.error("Error creating/updating housing:", error);
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `housings/${housingId}`,
        operation: isEditing ? 'update' : 'create',
        requestResourceData: data,
      }));
      toast({
        variant: 'destructive',
        title: "Erreur",
        description: `L'annonce n'a pas pu être ${isEditing ? 'mise à jour' : 'créée'}.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Modifier' : 'Créer'} une annonce de logement</DialogTitle>
          <DialogDescription>Remplissez les détails ci-dessous pour publier votre annonce.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-h-[80vh] overflow-y-auto p-1 pr-4">
          <FormSection title="Image de l'annonce" description="Une belle photo attire plus de locataires.">
            <div className="flex flex-col items-center justify-center aspect-video border rounded-md p-2 bg-muted/50">
              {previewUrl ? (
                <div className="relative w-full h-full">
                  <Image src={previewUrl} alt="Aperçu de l'image" layout="fill" objectFit="contain" className="rounded-md" />
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <ImageIcon className="h-12 w-12 mx-auto" strokeWidth={1} />
                  <p className="mt-2 text-sm">Téléchargez une image</p>
                </div>
              )}
            </div>
            <Input id="imageUrl" type="file" accept="image/*" onChange={handleImageUpload} />
          </FormSection>

          <FormSection title="Informations Générales" description="Décrivez le logement que vous proposez.">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input id="title" {...register('title')} placeholder="Ex: Kot lumineux près de l'UNamur" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} placeholder="Décrivez le logement, ses atouts, etc." />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="type">Type de logement</Label>
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
          </FormSection>

          <FormSection title="Caractéristiques" description="Détails sur le prix, la surface et les chambres.">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix (€/mois)</Label>
                <Input id="price" type="number" {...register('price')} />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div>
                <Label htmlFor="surfaceArea">Surface (m²)</Label>
                <Input id="surfaceArea" type="number" {...register('surfaceArea')} />
                {errors.surfaceArea && <p className="text-xs text-destructive">{errors.surfaceArea.message}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="bedrooms">Nombre de chambres</Label>
              <Input id="bedrooms" type="number" {...register('bedrooms')} />
              {errors.bedrooms && <p className="text-xs text-destructive">{errors.bedrooms.message}</p>}
            </div>
          </FormSection>

          <FormSection title="Localisation" description="Où se situe le logement ?">
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" {...register('address')} placeholder="Ex: Rue de Bruxelles 53" />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input id="city" {...register('city')} placeholder="Ex: Namur" />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
          </FormSection>


          <DialogFooter className="sticky bottom-0 bg-background pt-4 -mb-4 -mx-1 p-6 border-t">
            <DialogClose asChild>
              <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || isUserLoading}>
              {loading ? (isEditing ? 'Mise à jour...' : 'Création...') : (isEditing ? 'Mettre à jour' : "Créer l'annonce")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
