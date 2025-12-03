

'use client';

import { useState, useMemo, useRef } from 'react';
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
import { Image as ImageIcon, ArrowLeft, AspectRatio, Music } from 'lucide-react';
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
    { title: "Gimme More", artist: "Britney Spears", url: "/music/gimme-more.mp3" },
    { title: "Espresso", artist: "Sabrina Carpenter", url: "/music/espresso.mp3" },
    { title: "Feather", artist: "Sabrina Carpenter", url: "/music/feather.mp3" },
];

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
      </DialogContent>
    </Dialog>
  );
}
