
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
import { Image as ImageIcon, ArrowLeft, AspectRatio, Music, Play, Pause, Search } from 'lucide-react';
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

const pixabayMusic = [
    { title: "Lofi Chill", artist: "FASSounds", url: "https://archive.org/download/lofi-chill-173895/lofi-chill-173895.mp3" },
    { title: "The Beat of Nature", artist: "Olexy", url: "https://archive.org/download/the-beat-of-nature-122841/the-beat-of-nature-122841.mp3" },
    { title: "In the Forest", artist: "Lesfm", url: "https://archive.org/download/in-the-forest-ambient-atmospheric-background-music-121403/in-the-forest-ambient-atmospheric-background-music-121403.mp3" },
    { title: "Powerful Trap", artist: "AlexiAction", url: "https://archive.org/download/powerful-trap-12 Powerful Trap (underscore)_main_powerful-trap-180180/powerful-trap-12%20Powerful%20Trap%20(underscore)_main_powerful-trap-180180.mp3" },
    { title: "Modern Vlo-fi", artist: "penguinmusic", url: "https://archive.org/download/modern-vlog-140795/modern-vlog-140795.mp3"},
    { title: "Relaxing", artist: "relaxdaily", url: "https://archive.org/download/relaxing-music-vol.1/Relaxing-Music-Vol.1-01-A.mp3" },
    { title: "Chill Abstract", artist: "Coma-Media", url: "https://archive.org/download/chill-abstract-intention-12099/chill-abstract-intention-12099.mp3" },
    { title: "Espresso", artist: "Sabrina Carpenter", url: "https://archive.org/download/sabrina-carpenter-espresso-official-video/Sabrina%20Carpenter%20-%20Espresso%20%28Official%20Video%29.mp3" }
];

const pixabaySoundEffects = [
    { title: "Whoosh", artist: "Pixabay", url: "https://archive.org/download/whoosh-sound-effect-152869/whoosh-sound-effect-152869.mp3" },
    { title: "Applaudissements", artist: "Pixabay", url: "https://archive.org/download/small-crowd-applause-6695/small-crowd-applause-6695.mp3" },
    { title: "Goutte d'eau", artist: "Pixabay", url: "https://archive.org/download/water-drop-sound-effect-6047/water-drop-sound-effect-6047.mp3" },
    { title: "Notification", artist: "Pixabay", url: "https://archive.org/download/cute-level-up-3-189853/cute-level-up-3-189853.mp3" },
    { title: "Rire", artist: "Pixabay", url: "https://archive.org/download/medium-crowd-laugh-40110/medium-crowd-laugh-40110.mp3" }
];

function MusicSelectionDialog({ onSelectSong, onClose }: { onSelectSong: (song: { title: string, url: string }) => void, onClose: () => void }) {
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
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
    
    const filterSongs = (songs: typeof pixabayMusic) => {
        if (!searchQuery) return songs;
        return songs.filter(song => 
            song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    const renderSongList = (songs: {title: string, artist: string, url: string}[]) => (
        <div className="space-y-2">
            {songs.map(song => (
                <div key={song.url} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
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
    );

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Choisir un son</DialogTitle>
                </DialogHeader>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Rechercher une musique..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Tabs defaultValue="music" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="music">Musique</TabsTrigger>
                        <TabsTrigger value="sfx">Effets Sonores</TabsTrigger>
                    </TabsList>
                    <TabsContent value="music" className="max-h-[50vh] overflow-y-auto">
                        {renderSongList(filterSongs(pixabayMusic))}
                    </TabsContent>
                    <TabsContent value="sfx" className="max-h-[50vh] overflow-y-auto">
                        {renderSongList(filterSongs(pixabaySoundEffects))}
                    </TabsContent>
                </Tabs>
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
