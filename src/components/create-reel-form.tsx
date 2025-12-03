
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
import { Film, Music } from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { Progress } from './ui/progress';

const reelSchema = z.object({
  caption: z.string().min(1, 'La légende est requise'),
  songTitle: z.string().optional(),
  audioUrl: z.string().optional(),
});

type ReelFormInputs = z.infer<typeof reelSchema>;

interface CreateReelFormProps {
  onClose: () => void;
}

const trendingSongs = [
    { title: "Gimme More", artist: "Britney Spears", url: "/music/gimme-more.mp3" },
    { title: "Espresso", artist: "Sabrina Carpenter", url: "/music/espresso.mp3" },
    { title: "Feather", artist: "Sabrina Carpenter", url: "/music/feather.mp3" },
];

export default function CreateReelForm({ onClose }: CreateReelFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ReelFormInputs>({
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
  const [showMusicSelection, setShowMusicSelection] = useState(false);
  const [selectedSong, setSelectedSong] = useState<{title: string, url: string} | null>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return "..";
    return name.substring(0, 2).toUpperCase();
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSong = (song: { title: string, url: string }) => {
      setSelectedSong(song);
      setValue('songTitle', song.title);
      setValue('audioUrl', song.url);
      setShowMusicSelection(false);
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
    <>
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
                
                <div className="border-t pt-4">
                    <Button variant="ghost" className="w-full justify-start p-0" onClick={() => setShowMusicSelection(true)}>
                        <Music className="h-4 w-4 mr-2" />
                        {selectedSong ? selectedSong.title : 'Ajouter de la musique'}
                    </Button>
                </div>

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
    {showMusicSelection && (
            <Dialog open onOpenChange={() => setShowMusicSelection(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sons populaires</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2">
                        {trendingSongs.map(song => (
                            <div key={song.title} onClick={() => handleSelectSong(song)} className="flex items-center justify-between p-2 rounded-md hover:bg-muted cursor-pointer">
                                <div>
                                    <p className="font-semibold">{song.title}</p>
                                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                                </div>
                                <audio src={song.url} controls className="h-8" />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                         <Button variant="secondary" onClick={() => setShowMusicSelection(false)}>Fermer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
    </>
  );
}
