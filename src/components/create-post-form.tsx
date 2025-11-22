
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import Image from 'next/image';
import { Link2 } from 'lucide-react';

const postSchema = z.object({
  caption: z.string().min(1, 'La légende est requise'),
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
});

type PostFormInputs = z.infer<typeof postSchema>;

interface CreatePostFormProps {
  onClose: () => void;
}

export default function CreatePostForm({ onClose }: CreatePostFormProps) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<PostFormInputs>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      caption: '',
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
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Créer une publication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
           <div className="px-6 pt-4 space-y-4 max-h-[70vh] overflow-y-auto">
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
                    placeholder="Quoi de neuf ?"
                    className="text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none min-h-[120px]"
                />
                {errors.caption && <p className="text-xs text-destructive mt-2">{errors.caption.message}</p>}
            </div>
            
            {imageUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image src={imageUrl} alt="Aperçu de l'image" layout="fill" objectFit="cover" />
                </div>
            )}

            <div>
                <Label htmlFor="imageUrl" className="sr-only">URL de l'image</Label>
                <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        id="imageUrl" 
                        placeholder="Coller l'URL de l'image (optionnel)" 
                        {...register('imageUrl')}
                        className="pl-9"
                    />
                </div>
                {errors.imageUrl && <p className="text-xs text-destructive mt-2">{errors.imageUrl.message}</p>}
            </div>
           </div>
          <DialogFooter className="p-6 bg-muted/50">
            <DialogClose asChild>
                <Button type="button" variant="ghost">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Publication...' : 'Publier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
