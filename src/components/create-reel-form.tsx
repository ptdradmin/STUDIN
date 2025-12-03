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
import { Film } from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { Progress } from './ui/progress';

const reelSchema = z.object({
  caption: z.string().min(1, 'La légende est requise'),
});

type ReelFormInputs = z.infer<typeof reelSchema>;

interface CreateReelFormProps {
  onClose: () => void;
}

const MAX_DURATION_SECONDS = 60;
const MAX_FILE_SIZE_MB = 50;

export default function CreateReelForm({ onClose }: CreateReelFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ReelFormInputs>({
    resolver: zodResolver(reelSchema),
  });
  
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return "..";
    return name.substring(0, 2).toUpperCase();
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        toast({ variant: "destructive", title: "Fichier trop volumineux", description: `La vidéo ne doit pas dépasser ${MAX_FILE_SIZE_MB} Mo.`});
        return;
      }
      
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      
      videoElement.onloadedmetadata = function() {
        window.URL.revokeObjectURL(videoElement.src);
        if (videoElement.duration > MAX_DURATION_SECONDS) {
          toast({
            variant: "destructive",
            title: "Vidéo trop longue",
            description: `Le Reel ne doit pas dépasser ${MAX_DURATION_SECONDS} secondes.`
          });
          if(event.target) {
            event.target.value = "";
          }
          setVideoFile(null);
          setPreviewUrl(null);
        } else {
            setVideoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                setPreviewUrl(reader.result);
              }
            };
            reader.readAsDataURL(file);
        }
      }
      videoElement.src = URL.createObjectURL(file);
    }
  };

  const onSubmit: SubmitHandler<ReelFormInputs> = async (data) => {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour publier.' });
      return;
    }
    if (!videoFile) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Une vidéo est requise." });
      return;
    }
    
    setLoading(true);

    try {
        const newDocRef = doc(collection(firestore, 'reels'));
        const videoRef = storageRef(storage, `reels/${newDocRef.id}/${videoFile.name}`);
        
        const uploadTask = uploadBytesResumable(videoRef, videoFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                setLoading(false);
                toast({ variant: "destructive", title: "Erreur de téléversement", description: "La vidéo n'a pas pu être envoyée."});
            },
            async () => {
                const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
                const reelData = {
                    ...data,
                    id: newDocRef.id,
                    userId: user.uid,
                    username: user.displayName?.split(' ')[0] || user.email?.split('@')[0],
                    userAvatarUrl: user.photoURL,
                    createdAt: serverTimestamp(),
                    likes: [],
                    comments: [],
                    videoUrl: videoUrl,
                };
                
                await setDoc(newDocRef, reelData);
                
                setLoading(false);
                toast({ title: 'Succès', description: 'Reel publié !' });
                onClose();
                router.refresh();
            }
        );

    } catch (error: any) {
        setLoading(false);
        toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de publier le Reel." });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-4 pb-0 border-b text-center">
           <DialogTitle className="text-base font-semibold">Créer un nouveau Reel</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
           <div className="p-4 space-y-4">
                <div className="flex flex-col items-center justify-center aspect-video border rounded-md p-4">
                    {previewUrl ? (
                         <div className="relative w-full h-full">
                            <video src={previewUrl} controls className="w-full h-full rounded-md" />
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <Film className="h-16 w-16 mx-auto" strokeWidth={1} />
                            <p className="mt-2 text-sm">Téléchargez une vidéo</p>
                            <p className="text-xs text-muted-foreground">(Max {MAX_FILE_SIZE_MB} Mo, {MAX_DURATION_SECONDS}s)</p>
                             <Button type="button" variant="link" asChild className="mt-1">
                                <Label htmlFor="video-upload" className="cursor-pointer">
                                    Sélectionner depuis l'ordinateur
                                </Label>
                            </Button>
                            <Input id="video-upload" type="file" accept="video/*" className="sr-only" onChange={handleVideoUpload} />
                        </div>
                    )}
                </div>

                {user && (
                    <div className="flex items-center gap-3">
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
                
                {loading && (
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Téléversement en cours...</p>
                        <Progress value={uploadProgress} />
                    </div>
                )}
           </div>
          <DialogFooter className="p-4 flex justify-end items-center bg-background border-t">
            <Button type="submit" disabled={loading || isUserLoading || !videoFile} className="w-full">
              {loading ? 'Publication...' : 'Partager'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
