
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
import { useAuth, useFirestore, useStorage, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';
import FormSection from './form-section';


const challengeSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  category: z.enum(['Exploration', 'Social', 'Créatif', 'Académique', 'Sportif', 'Environnement'], { required_error: 'La catégorie est requise' }),
  difficulty: z.enum(['facile', 'moyen', 'difficile'], { required_error: 'La difficulté est requise' }),
  points: z.preprocess((val) => Number(val), z.number().min(1, 'Les points sont requis')),
  location: z.string().optional(),
});

type ChallengeFormInputs = z.infer<typeof challengeSchema>;

interface CreateChallengeFormProps {
  onClose: () => void;
}

export default function CreateChallengeForm({ onClose }: CreateChallengeFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<ChallengeFormInputs>({
    resolver: zodResolver(challengeSchema),
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const onSubmit: SubmitHandler<ChallengeFormInputs> = async (data) => {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }
    if (!imageFile || !previewUrl) {
        toast({ variant: 'destructive', title: 'Erreur', description: "L'image est requise." });
        return;
    }
    setLoading(true);
    toast({ title: 'Création...', description: 'Votre défi est en cours de publication.' });
    onClose();

    const newDocRef = doc(collection(firestore, 'challenges'));
        
    const challengeData = {
        ...data,
        id: newDocRef.id,
        creatorId: user.uid,
        createdAt: serverTimestamp(),
        imageUrl: previewUrl, // optimistic
    };
    
    setDocumentNonBlocking(newDocRef, challengeData, { merge: false });

    const imageRef = storageRef(storage, `challenges/${newDocRef.id}/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(imageRef, imageFile);

    uploadTask.on('state_changed',
      () => {},
      (error) => {
          updateDocumentNonBlocking(newDocRef, { uploadError: true });
          toast({ variant: "destructive", title: "Erreur d'envoi", description: "L'image n'a pas pu être envoyée."});
      },
      async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          updateDocumentNonBlocking(newDocRef, { imageUrl: downloadURL });
      }
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Créer un nouveau défi</DialogTitle>
           <DialogDescription>Remplissez les détails pour créer un défi pour la communauté.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
          <FormSection title="Image du défi" description="Une image attrayante pour votre défi.">
            <div className="flex flex-col items-center justify-center aspect-video border rounded-md p-2 bg-muted/50">
                {previewUrl ? (
                <div className="relative w-full h-full">
                    <Image src={previewUrl} alt="Aperçu de l'image" layout="fill" objectFit="contain" />
                </div>
                ) : (
                <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-16 w-16 mx-auto" strokeWidth={1} />
                    <p className="mt-2 text-sm">Téléchargez une image</p>
                </div>
                )}
            </div>
            <div>
                <Label htmlFor="imageUrl" className="sr-only">Image</Label>
                <Input id="imageUrl" type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
          </FormSection>

          <FormSection title="Informations principales" description="Les détails essentiels de votre défi.">
              <div>
                <Label htmlFor="title">Titre du défi</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
          </FormSection>

          <FormSection title="Paramètres du défi" description="Catégorie, difficulté et points.">
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Exploration">Exploration</SelectItem>
                                    <SelectItem value="Social">Social</SelectItem>
                                    <SelectItem value="Créatif">Créatif</SelectItem>
                                    <SelectItem value="Académique">Académique</SelectItem>
                                     <SelectItem value="Sportif">Sportif</SelectItem>
                                      <SelectItem value="Environnement">Environnement</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="difficulty">Difficulté</Label>
                    <Controller
                        name="difficulty"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="facile">Facile</SelectItem>
                                    <SelectItem value="moyen">Moyen</SelectItem>
                                    <SelectItem value="difficile">Difficile</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.difficulty && <p className="text-xs text-destructive">{errors.difficulty.message}</p>}
                </div>
            </div>
            <div>
                <Label htmlFor="points">Points</Label>
                <Input id="points" type="number" {...register('points')} />
                {errors.points && <p className="text-xs text-destructive">{errors.points.message}</p>}
            </div>
          </FormSection>
          
           <FormSection title="Lieu (Optionnel)" description="Si le défi est lié à un lieu précis.">
             <div>
                <Label htmlFor="location">Lieu</Label>
                <Input id="location" {...register('location')} placeholder="Ex: Grand-Place, Bruxelles" />
                {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
            </div>
           </FormSection>


          <DialogFooter className="sticky bottom-0 bg-background pt-4 -m-1 -mb-4 p-6 border-t">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || isUserLoading}>
              {loading ? 'Création...' : "Créer le défi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
