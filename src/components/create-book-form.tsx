

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
import { collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';

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


const bookSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  author: z.string().min(1, "L'auteur est requis"),
  description: z.string().optional(),
  condition: z.enum(['Neuf', 'Très bon', 'Bon', 'Acceptable'], { required_error: "L'état est requis" }),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'Le prix est requis')),
  course: z.string().optional(),
  university: z.string().optional(),
});

type BookFormInputs = z.infer<typeof bookSchema>;

interface CreateBookFormProps {
  onClose: () => void;
}

export default function CreateBookForm({ onClose }: CreateBookFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<BookFormInputs>({
    resolver: zodResolver(bookSchema),
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

  const onSubmit: SubmitHandler<BookFormInputs> = (data) => {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }
    if (!imageFile || !previewUrl) {
        toast({ variant: 'destructive', title: 'Erreur', description: "L'image est requise." });
        return;
    }
    setLoading(true);
    toast({ title: 'Création...', description: 'Votre annonce est en cours de publication.' });
    onClose();

    const newDocRef = doc(collection(firestore, 'books'));
    
    const bookData = {
        ...data,
        id: newDocRef.id,
        sellerId: user.uid,
        sellerName: user.displayName?.split(' ')[0] || user.email?.split('@')[0],
        sellerAvatarUrl: user.photoURL,
        createdAt: serverTimestamp(),
        imageUrl: previewUrl, // Use local preview URL initially
    };

    setDocumentNonBlocking(newDocRef, bookData);

    const imageRef = storageRef(storage, `books/${newDocRef.id}/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(imageRef, imageFile);

    uploadTask.on('state_changed',
      () => {}, // Progress
      (error) => {
          console.error("Upload error:", error);
          updateDoc(newDocRef, { uploadError: true });
      },
      async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          updateDoc(newDocRef, { imageUrl: downloadURL });
      }
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Vendre un livre</DialogTitle>
           <DialogDescription>Remplissez les détails pour mettre votre livre en vente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
          <FormSection title="Photo du livre" description="Une photo claire de la couverture.">
            <div className="flex flex-col items-center justify-center aspect-video border rounded-md p-2 bg-muted/50">
                {previewUrl ? (
                <div className="relative w-full h-full">
                    <Image src={previewUrl} alt="Aperçu de l'image" layout="fill" objectFit="contain" />
                </div>
                ) : (
                <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-16 w-16 mx-auto" strokeWidth={1} />
                    <p className="mt-2 text-sm">Téléchargez une photo</p>
                </div>
                )}
            </div>
            <div>
                <Label htmlFor="imageUrl" className="sr-only">Image</Label>
                <Input id="imageUrl" type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
          </FormSection>

          <FormSection title="Informations sur le livre" description="Titre, auteur et état du livre.">
              <div>
                <Label htmlFor="title">Titre du livre</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div>
                <Label htmlFor="author">Auteur(s)</Label>
                <Input id="author" {...register('author')} />
                {errors.author && <p className="text-xs text-destructive">{errors.author.message}</p>}
            </div>
            <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea id="description" {...register('description')} placeholder="Ex: édition, année, surlignage..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                    <Label htmlFor="condition">État</Label>
                    <Controller
                        name="condition"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Neuf">Neuf</SelectItem>
                                    <SelectItem value="Très bon">Très bon</SelectItem>
                                    <SelectItem value="Bon">Bon</SelectItem>
                                    <SelectItem value="Acceptable">Acceptable</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.condition && <p className="text-xs text-destructive">{errors.condition.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="price">Prix (€)</Label>
                    <Input id="price" type="number" step="0.5" {...register('price')} />
                    {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                </div>
            </div>
          </FormSection>
          
           <FormSection title="Contexte académique" description="(Optionnel) Pour aider les autres à trouver le livre.">
             <div>
                <Label htmlFor="course">Matière / Code du cours</Label>
                <Input id="course" {...register('course')} placeholder="Ex: CHIM-F-101" />
            </div>
             <div>
                <Label htmlFor="university">Université / Haute École</Label>
                <Input id="university" {...register('university')} placeholder="Ex: UNamur" />
            </div>
           </FormSection>


          <DialogFooter className="sticky bottom-0 bg-background pt-4 -m-1 -mb-4 p-6 border-t">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || isUserLoading}>
              {loading ? 'Publication...' : "Mettre en vente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
