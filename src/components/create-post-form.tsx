
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useStorage } from '@/firebase';
import { collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';

const postSchema = z.object({
  caption: z.string().min(1, 'La légende est requise'),
  location: z.string().optional(),
});

type PostFormInputs = z.infer<typeof postSchema>;

interface CreatePostFormProps {
  onClose: () => void;
}

const filters = [
    { name: 'Normal', className: 'filter-none' },
    { name: 'Grayscale', className: 'filter-grayscale' },
    { name: 'Sepia', className: 'filter-sepia' },
    { name: 'Saturate', className: 'filter-saturate' },
    { name: 'Contrast', className: 'filter-contrast' },
    { name: 'Brightness', className: 'filter-brightness' },
    { name: 'Hue-Rotate', className: 'filter-hue-rotate' },
    { name: 'Invert', className: 'filter-invert' },
];

export default function CreatePostForm({ onClose }: CreatePostFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<PostFormInputs>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      caption: '',
      location: '',
    }
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('filter-none');

  const getInitials = (name?: string | null) => {
    if (!name) return "..";
    const parts = name.split(' ');
    if (parts.length > 1 && parts[0] && parts[1]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

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

  const onSubmit: SubmitHandler<PostFormInputs> = async (data) => {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour poster.' });
      return;
    }
    if (!imageFile) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Une image est requise pour la publication." });
        return;
    }
    setLoading(true);
    toast({ title: 'Publication...', description: 'Votre publication est en cours de création.' });

    try {
        const newDocRef = doc(collection(firestore, 'posts'));
        
        const imageRef = storageRef(storage, `posts/${newDocRef.id}/${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        const postData = {
            ...data,
            id: newDocRef.id,
            userId: user.uid,
            username: user.displayName?.split(' ')[0] || user.email?.split('@')[0],
            userAvatarUrl: user.photoURL,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            likes: [],
            comments: [],
            imageUrl: imageUrl,
        };
        
        await setDoc(newDocRef, postData);
        
        toast({ title: 'Succès', description: 'Publication créée !' });
        onClose();
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de créer la publication." });
        setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0">
        <DialogHeader className="p-4 pb-0 border-b text-center">
           <DialogTitle className="text-base font-semibold">Créer une nouvelle publication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
           <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] min-h-[60vh]">
                <div className="flex flex-col items-center justify-center aspect-square border-r bg-muted relative">
                    {previewUrl ? (
                         <div className="relative w-full h-full">
                            <Image src={previewUrl} alt="Aperçu de l'image" layout="fill" objectFit="cover" className={selectedFilter} />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center">
                            <ImageIcon className="h-16 w-16 text-muted-foreground" strokeWidth={1} />
                            <p className="mt-4 text-muted-foreground">Téléchargez une photo ici</p>
                             <Button type="button" variant="link" asChild className="mt-2">
                                <Label htmlFor="image-upload" className="cursor-pointer">
                                    Sélectionner depuis l'ordinateur
                                </Label>
                            </Button>
                            <Input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                        </div>
                    )}
                </div>

                <div className="p-4 flex flex-col">
                    {user && (
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-7 w-7">
                                <AvatarImage src={user.photoURL ?? undefined} />
                                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold text-sm">{user.displayName?.split(' ')[0]}</p>
                        </div>
                    )}
                    <div>
                        <Textarea
                            id="caption"
                            {...register('caption')}
                            placeholder="Écrivez une légende..."
                            className="text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none min-h-[150px]"
                        />
                        {errors.caption && <p className="text-xs text-destructive mt-2">{errors.caption.message}</p>}
                    </div>

                    {previewUrl && (
                        <div className="mt-4">
                            <p className="text-sm font-medium mb-2">Filtres</p>
                            <div className="grid grid-cols-4 gap-2">
                                {filters.map(filter => (
                                    <div key={filter.name} onClick={() => setSelectedFilter(filter.className)} className="cursor-pointer">
                                        <div className={cn("relative aspect-square rounded-md overflow-hidden ring-2 ring-offset-2 ring-offset-background", selectedFilter === filter.className ? 'ring-primary' : 'ring-transparent')}>
                                            <Image src={previewUrl} alt={filter.name} layout="fill" objectFit="cover" className={filter.className} />
                                        </div>
                                        <p className="text-xs text-center mt-1">{filter.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="border-t mt-auto pt-4">
                        <div className="relative">
                             <Input 
                                id="location" 
                                placeholder="Ajouter un lieu" 
                                {...register('location')}
                                className="border-none p-0 focus-visible:ring-0"
                            />
                        </div>
                    </div>
                </div>
           </div>
          <DialogFooter className="p-4 flex justify-end items-center bg-background border-t">
            <Button type="submit" disabled={loading || isUserLoading || !previewUrl} variant="link" className="font-bold">
              {loading ? 'Publication...' : 'Partager'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
