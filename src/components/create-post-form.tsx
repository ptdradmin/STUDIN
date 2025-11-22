
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
import { useAuth, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

const postSchema = z.object({
  caption: z.string().min(1, 'La légende est requise'),
  imageUrl: z.string().url('URL invalide').min(1, "L'URL de l'image est requise"),
});

type PostFormInputs = z.infer<typeof postSchema>;

interface CreatePostFormProps {
  onClose: () => void;
}

export default function CreatePostForm({ onClose }: CreatePostFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<PostFormInputs>({
    resolver: zodResolver(postSchema),
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const onSubmit: SubmitHandler<PostFormInputs> = async (data) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour poster.' });
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(firestore, 'posts'), {
        ...data,
        userId: user.uid,
        userDisplayName: user.displayName,
        userAvatarUrl: user.photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${user.email}`,
        createdAt: serverTimestamp(),
        likes: 0,
        comments: []
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer une publication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="caption">Légende</Label>
            <Textarea id="caption" {...register('caption')} />
            {errors.caption && <p className="text-xs text-destructive">{errors.caption.message}</p>}
          </div>
          <div>
            <Label htmlFor="imageUrl">URL de l'image</Label>
            <Input id="imageUrl" placeholder="https://picsum.photos/..." {...register('imageUrl')} />
            {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
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
