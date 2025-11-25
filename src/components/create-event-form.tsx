
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useStorage, setDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FirestorePermissionError, errorEmitter } from '@/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const eventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  category: z.enum(['soirée', 'conférence', 'sport', 'culture'], { required_error: 'La catégorie est requise' }),
  startDate: z.string().min(1, 'La date de début est requise'),
  city: z.string().min(1, 'La ville est requise'),
  address: z.string().min(1, 'L\'adresse est requise'),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'Le prix est requis')),
});

type EventFormInputs = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
  onClose: () => void;
}

export default function CreateEventForm({ onClose }: CreateEventFormProps) {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<EventFormInputs>({
    resolver: zodResolver(eventSchema),
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const onSubmit: SubmitHandler<EventFormInputs> = async (data) => {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }
    if (!imageFile) {
        toast({ variant: 'destructive', title: 'Erreur', description: "L'image est requise." });
        return;
    }
    setLoading(true);

    try {
        const newDocRef = doc(collection(firestore, 'events'));
        const imageRef = storageRef(storage, `events/${newDocRef.id}/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);

        const eventData = {
            ...data,
            id: newDocRef.id,
            organizerId: user.uid,
            organizerUsername: user.displayName || user.email?.split('@')[0],
            organizerAvatarUrl: user.photoURL,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            endDate: data.startDate, // simplified
            locationName: data.address, // simplified
            coordinates: [50.8503, 4.3517], // Default to Brussels, TODO: Geocode
            imageHint: "student event",
            imageUrl: imageUrl,
        };

        setDocumentNonBlocking(newDocRef, eventData, {});

        toast({ title: 'Succès', description: 'Événement créé !' });
        onClose();
    } catch(error) {
        if (!(error instanceof FirestorePermissionError)) {
            console.error("Erreur de création d'événement:", error);
            toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de créer l\'événement.' });
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un événement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
          <div>
            <Label htmlFor="title">Titre de l'événement</Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
           <div>
            <Label htmlFor="category">Catégorie</Label>
            <Controller
                name="category"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner la catégorie" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="soirée">Soirée</SelectItem>
                            <SelectItem value="conférence">Conférence</SelectItem>
                            <SelectItem value="sport">Sport</SelectItem>
                            <SelectItem value="culture">Culture</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            />
            {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Date et heure</Label>
              <Input id="startDate" type="datetime-local" {...register('startDate')} />
              {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
            </div>
            <div>
              <Label htmlFor="price">Prix (€)</Label>
              <Input id="price" type="number" {...register('price')} defaultValue={0} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
          </div>
           <div>
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" {...register('address')} placeholder="Ex: Rue de l'université 10" />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
             <div>
              <Label htmlFor="city">Ville</Label>
              <Input id="city" {...register('city')} placeholder="Ex: Namur" />
              {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
            </div>
          <div>
            <Label htmlFor="imageUrl">Image</Label>
            <Input id="imageUrl" type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || isUserLoading}>
              {loading ? 'Création...' : 'Créer l\'événement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
