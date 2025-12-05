

'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useStorage, useDoc, setDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import type { UserProfile } from '@/lib/types';
import { generateCaption } from '@/ai/flows/generate-caption-flow';

const postSchema = z.object({
  caption: z.string().min(1, 'La légende est requise'),
  location: z.string().optional(),
});

type PostFormInputs = z.infer<typeof postSchema>;

interface CreatePostFormProps {
  onClose: () => void;
}

export default function CreatePostForm({ onClose }: CreatePostFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PostFormInputs>({
    resolver: zodResolver(postSchema),
  });
  
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const userProfileRef = useMemo(() => !user || !firestore ? null : doc(firestore, 'users', user.uid), [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const getInitials = (name?: string | null) => {
    if (!name) return "..";
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
  
  const handleGenerateCaption = async () => {
    if (!previewUrl) {
      toast({ variant: 'destructive', title: "Image requise", description: "Veuillez d'abord sélectionner une image." });
      return;
    }
     if (isProfileLoading) {
      toast({ variant: 'destructive', title: "Chargement...", description: "Le profil est en cours de chargement." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateCaption({
        photoDataUri: previewUrl,
        userProfile: userProfile ? {
          username: userProfile.username,
          university: userProfile.university,
          fieldOfStudy: userProfile.fieldOfStudy,
          bio: userProfile.bio,
        } : undefined
      });
      setValue('caption', result.caption);
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Erreur', description: "La génération de la légende a échoué." });
    } finally {
      setIsGenerating(false);
    }
  }

  const onSubmit: SubmitHandler<PostFormInputs> = async (data) => {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour publier.' });
      return;
    }
    if (!imageFile || !previewUrl) {
        toast({ variant: 'destructive', title: 'Erreur', description: "L'image est requise." });
        return;
    }
    setLoading(true);
    toast({ title: 'Publication...', description: 'Votre publication est en cours de téléversement.' });
    onClose();

    const newDocRef = doc(collection(firestore, 'posts'));
    
    setDocumentNonBlocking(newDocRef, {
        ...data,
        id: newDocRef.id,
        userId: user.uid,
        username: userProfile?.username || user.displayName?.split(' ')[0] || user.email?.split('@')[0],
        userAvatarUrl: userProfile?.profilePicture || user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: [],
        comments: [],
        imageUrl: previewUrl, // Use local data URI for optimistic UI
        isUploading: true,
        fileType: 'image',
    }, { merge: false });

    const fileRef = storageRef(storage, `posts/${newDocRef.id}/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(fileRef, imageFile);

    uploadTask.on('state_changed',
        () => {}, // Progress updates ignored for non-blocking
        (error) => {
            console.error("Upload error:", error);
            updateDoc(newDocRef, { isUploading: false, uploadError: true });
        },
        async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            updateDoc(newDocRef, {
                imageUrl: downloadURL,
                isUploading: false,
            });
        }
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-4 pb-0 border-b text-center">
           <DialogTitle className="text-base font-semibold">Créer une nouvelle publication</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
           <div className="p-4 space-y-4">
                <div className="flex flex-col items-center justify-center aspect-square border rounded-md p-4">
                    {previewUrl ? (
                        <div className="relative w-full h-full">
                            <Image src={previewUrl} alt="Aperçu de l'image" layout="fill" objectFit="contain" />
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <ImageIcon className="h-16 w-16 mx-auto" strokeWidth={1} />
                            <p className="mt-2 text-sm">Téléchargez une photo</p>
                             <Button type="button" variant="link" asChild className="mt-1">
                                <Label htmlFor="image-upload" className="cursor-pointer">
                                    Sélectionner depuis l'ordinateur
                                </Label>
                            </Button>
                            <Input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                        </div>
                    )}
                </div>

                {user && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL ?? undefined} />
                            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                        </Avatar>
                         <Textarea
                            id="caption"
                            {...register('caption')}
                            placeholder="Écrivez une légende..."
                            className="text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none min-h-[60px]"
                        />
                    </div>
                )}
                {errors.caption && <p className="text-xs text-destructive mt-2">{errors.caption.message}</p>}
                
                <div className="border-t pt-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start p-0 h-auto" type="button" onClick={handleGenerateCaption} disabled={isGenerating || isProfileLoading}>
                        {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                        {isGenerating ? 'Génération...' : 'Générer avec l\'IA'}
                    </Button>
                    <div>
                        <Label htmlFor="location" className="sr-only">Lieu</Label>
                        <Input id="location" {...register('location')} placeholder="Ajouter un lieu" className="border-none px-0 shadow-none" />
                    </div>
                </div>

           </div>
          <DialogFooter className="p-4 flex justify-end items-center bg-background border-t">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || isUserLoading || !imageFile}>
              {loading ? 'Publication...' : 'Partager'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
