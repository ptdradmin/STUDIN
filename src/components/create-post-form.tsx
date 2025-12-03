
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useStorage, errorEmitter, FirestorePermissionError, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import Image from 'next/image';
import { Image as ImageIcon, ArrowLeft, AspectRatio, Music, Play, Pause } from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';
import { Progress } from './ui/progress';


const postSchema = z.object({
  caption: z.string().min(1, 'La légende est requise'),
  location: z.string().optional(),
  songTitle: z.string().optional(),
  audioUrl: z.string().optional(),
});

type PostFormInputs = z.infer<typeof postSchema>;

interface CreatePostFormProps {
  onClose: () => void;
}

const trendingSongs = [
    { title: "Street Vibe", artist: "Rap/Hip-Hop Beat", url: "https://archive.org/download/22-rap-beat-instrumental-hip-hop-type-beat-2022-insane/22.%20Rap%20Beat%20Instrumental%20Hip%20Hop%20Type%20Beat%202022%20-%20%27Insane%27.mp3" },
    { title: "Chill Reggae", artist: "Reggae Instrumental", url: "https://archive.org/download/reggae-instrumental_202302/Reggae%20Instrumental.mp3" },
    { title: "808 Flow", artist: "Trap Beat", url: "https://archive.org/download/free-trap-beat-savage/Free%20Trap%20Beat%20-%20Savage.mp3" },
    { title: "Ibiza Sunrise", artist: "Electro House Mix", url: "https://archive.org/download/powerful-stylish-stomp-groove-electro-house-version-60s-14022/powerful-stylish-stomp-groove-electro-house-version-60s-14022.mp3" },
    { title: "Warehouse Rave", artist: "Techno Groove", url: "https://archive.org/download/techno-power-191242/techno-power-191242.mp3" },
    { title: "Industrial Core", artist: "Hardcore Rhythm", url: "https://archive.org/download/gabber-kick-drum-samples/Hardcore%20Kick%202.mp3" },
    { title: "Lofi Chill", artist: "Lofi Beat", url: "https://archive.org/download/lofi-beat-chill-instrumental/Lofi%20Beat%20Chill%20Instrumental.mp3" },
];


function MusicSelectionDialog({ onSelectSong, onClose }: { onSelectSong: (song: { title: string, url: string }) => void, onClose: () => void }) {
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = (song: { title: string, url: string }) => {
        if (currentlyPlaying === song.url) {
            audioRef.current?.pause();
            setCurrentlyPlaying(null);
        } else {
            if (audioRef.current) {
                audioRef.current.src = song.url;
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
            setCurrentlyPlaying(song.url);
        }
    };

    useEffect(() => {
        audioRef.current = new Audio();
        const handleEnded = () => setCurrentlyPlaying(null);
        audioRef.current.addEventListener('ended', handleEnded);
        
        return () => {
            const currentAudio = audioRef.current;
            currentAudio?.pause();
            currentAudio?.removeEventListener('ended', handleEnded);
        }
    }, []);

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sons populaires</DialogTitle>
                </DialogHeader>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {trendingSongs.map(song => (
                        <div key={song.title} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <div className="cursor-pointer flex-grow" onClick={() => onSelectSong(song)}>
                                <p className="font-semibold">{song.title}</p>
                                <p className="text-sm text-muted-foreground">{song.artist}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => togglePlay(song)}>
                                {currentlyPlaying === song.url ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            </Button>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function CreatePostForm({ onClose }: CreatePostFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PostFormInputs>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      caption: '',
      location: '',
      songTitle: '',
      audioUrl: '',
    }
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showMusicSelection, setShowMusicSelection] = useState(false);
  const [selectedSong, setSelectedSong] = useState<{title: string, url: string} | null>(null);


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
        setStep(2);
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

  const onSubmit: SubmitHandler<PostFormInputs> = (data) => {
    if (isUserLoading || isProfileLoading || !userProfile || !firestore || !storage || !user) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Le service est indisponible ou votre profil n\'est pas chargé.' });
        return;
    }
    if (!imageFile) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Une image est requise pour la publication." });
        return;
    }
    setLoading(true);
    toast({ title: 'Publication en cours...', description: 'Votre publication apparaîtra dans le fil.' });
    onClose();

    const newDocRef = doc(collection(firestore, 'posts'));
    const imageRef = storageRef(storage, `posts/${newDocRef.id}/${imageFile.name}`);

    const postData = {
        ...data,
        id: newDocRef.id,
        userId: user!.uid,
        username: userProfile.username,
        userAvatarUrl: userProfile.profilePicture,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: [],
        comments: [],
        imageUrl: previewUrl, 
        isUploading: true,
    };
    
    setDocumentNonBlocking(newDocRef, postData);
    
    const uploadTask = uploadBytesResumable(imageRef, imageFile);

    uploadTask.on('state_changed',
        () => {}, // Progress updates ignored for non-blocking
        (error) => {
            console.error("Upload error:", error);
            updateDoc(newDocRef, { uploadError: true, isUploading: false });
            toast({ variant: 'destructive', title: 'Erreur de téléversement', description: "L'image n'a pas pu être envoyée."});
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                updateDoc(newDocRef, {
                    imageUrl: downloadURL,
                    isUploading: false,
                    updatedAt: serverTimestamp()
                });
            });
        }
    );
  };

  return (
    <>
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 h-[80vh] flex flex-col" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="p-3 pb-0 border-b text-center relative flex justify-between items-center flex-row flex-shrink-0">
            {step === 2 && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setStep(1)}><ArrowLeft className="h-5 w-5" /></Button>
            )}
           <DialogTitle className="text-base font-semibold absolute left-1/2 -translate-x-1/2">
             {step === 1 ? "Créer une nouvelle publication" : "Édition"}
           </DialogTitle>
            {step === 2 && (
              <Button variant="link" onClick={handleSubmit(onSubmit)} className="ml-auto p-0 h-auto font-bold" disabled={loading || isUserLoading || isProfileLoading}>
                 {loading ? 'Publication...' : 'Partager'}
              </Button>
            )}
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden">
          {step === 1 && (
             <div className="flex flex-col items-center justify-center h-full text-center">
                  <ImageIcon className="h-24 w-24 text-muted-foreground" strokeWidth={1} />
                  <p className="mt-4 text-xl">Faites glisser les photos ici</p>
                  <Button type="button" variant="link" asChild className="mt-2">
                      <Label htmlFor="image-upload" className="cursor-pointer text-base">
                          Sélectionner depuis l'ordinateur
                      </Label>
                  </Button>
                  <Input id="image-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
              </div>
          )}

          {step === 2 && previewUrl && (
             <div className="flex h-full">
                  <div className="flex-1 flex items-center justify-center bg-black/90 relative">
                     <div className="relative w-full aspect-square max-w-full max-h-full">
                        <Image src={previewUrl} alt="Aperçu" layout="fill" objectFit="contain" />
                      </div>
                  </div>
                  
                  <div className="w-[320px] flex flex-col border-l">
                    <div className="flex-shrink-0">
                      {userProfile && (
                          <div className="flex items-center gap-3 p-4">
                              <Avatar className="h-7 w-7">
                                  <AvatarImage src={userProfile.profilePicture ?? undefined} />
                                  <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                              </Avatar>
                              <p className="font-semibold text-sm">{userProfile.username}</p>
                          </div>
                      )}
                    </div>
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                      <Textarea
                          id="caption"
                          {...register('caption')}
                          placeholder="Écrivez une légende..."
                          className="text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none flex-grow min-h-[100px]"
                      />
                      {errors.caption && <p className="text-xs text-destructive mt-2">{errors.caption.message}</p>}
                      <div className="border-t pt-4">
                        <Input 
                            id="location" 
                            placeholder="Ajouter un lieu" 
                            {...register('location')}
                            className="border-none p-0 focus-visible:ring-0 text-sm"
                        />
                      </div>
                       <div className="border-t pt-4">
                         <Button variant="ghost" className="w-full justify-start p-0" onClick={() => setShowMusicSelection(true)}>
                            <Music className="h-4 w-4 mr-2" />
                            {selectedSong ? selectedSong.title : 'Ajouter de la musique'}
                         </Button>
                      </div>
                    </div>
                  </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
    {showMusicSelection && <MusicSelectionDialog onSelectSong={handleSelectSong} onClose={() => setShowMusicSelection(false)} />}
    </>
  );
}
