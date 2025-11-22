
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
import { useAuth, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import Image from 'next/image';
import { Image as ImageIcon, MapPin } from 'lucide-react';

const postSchema = z.object({
  caption: z.string().min(1, 'La légende est requise'),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
});

type PostFormInputs = z.infer<typeof postSchema>;

interface CreatePostFormProps {
  onClose: () => void;
}

export default function CreatePostForm({ onClose }: CreatePostFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PostFormInputs>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      caption: '',
      location: '',
      imageUrl: '',
    }
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const imageUrl = watch('imageUrl');

  const getInitials = (name?: string | null) => {
    if (!name) return "..";
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<PostFormInputs> = async (data) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour poster.' });
      return;
    }
    setLoading(true);
    try {
      addDocumentNonBlocking(collection(firestore, 'posts'), {
        ...data,
        userId: user.uid,
        userDisplayName: user.displayName || user.email?.split('@')[0],
        userAvatarUrl: user.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: [],
        comments: [],
      });
      toast({ title: 'Succès', description: 'Publication créée !' });
      onClose();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de créer la publication.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-6 pb-0 text-center">
           <h2 className="text-lg font-semibold">Créer une nouvelle publication</h2>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
           <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {imageUrl ? (
                <div className="relative aspect-square border-y">
                    <Image src={imageUrl} alt="Aperçu de l'image" layout="fill" objectFit="cover" />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center aspect-square border-y">
                    <ImageIcon className="h-16 w-16 text-muted-foreground" strokeWidth={1} />
                    <p className="mt-4 text-muted-foreground">Téléchargez une photo ici</p>
                </div>
            )}
             <div className="px-6 space-y-4">
                 {user && (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL ?? undefined} />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                        <p className="font-semibold">{user.displayName}</p>
                    </div>
                 )}
                <div>
                    <Textarea
                        id="caption"
                        {...register('caption')}
                        placeholder="Écrivez une légende..."
                        className="text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none min-h-[60px]"
                    />
                    {errors.caption && <p className="text-xs text-destructive mt-2">{errors.caption.message}</p>}
                </div>

                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="location" 
                        placeholder="Ajouter un lieu" 
                        {...register('location')}
                        className="pl-9"
                    />
                </div>
             </div>
           </div>
          <DialogFooter className="p-4 flex justify-between items-center bg-background border-t">
             <div className="relative">
                <Button type="button" variant="outline" size="icon" asChild>
                    <Label htmlFor="image-upload" className="cursor-pointer">
                        <ImageIcon className="h-5 w-5" />
                        <span className="sr-only">Télécharger une image</span>
                    </Label>
                </Button>
                <Input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
            </div>
            <div className="flex gap-2">
                 <DialogClose asChild>
                    <Button type="button" variant="ghost">Annuler</Button>
                </DialogClose>
                <Button type="submit" disabled={loading}>
                {loading ? 'Publication...' : 'Publier'}
                </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
