

'use client';

import { useState, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useStorage, errorEmitter, FirestorePermissionError, useDoc, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import Image from 'next/image';
import { Image as ImageIcon, ArrowLeft, Crop } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/lib/types';


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
    { name: 'Clarendon', className: 'filter-contrast-[1.2] filter-saturate-[1.35]' },
    { name: 'Gingham', className: 'filter-brightness-105 filter-hue-rotate-[-10deg]' },
    { name: 'Moon', className: 'filter-grayscale filter-contrast-110 filter-brightness-110' },
    { name: 'Lark', className: 'filter-contrast-90 filter-saturate-110' },
    { name: 'Reyes', className: 'filter-sepia-[0.22] filter-brightness-110 filter-contrast-[0.85] filter-saturate-[0.75]' },
    { name: 'Juno', className: 'filter-contrast-120 filter-brightness-110 filter-saturate-180' },
    { name: 'Slumber', className: 'filter-saturate-[0.66] filter-brightness-105' },
    { name: 'Crema', className: 'filter-sepia-[0.5] filter-contrast-120 filter-saturate-120' },
    { name: 'Ludwig', className: 'filter-brightness-105 filter-saturate-200' },
    { name: 'Aden', className: 'filter-hue-rotate-[-20deg] filter-contrast-90 filter-saturate-[0.85] filter-brightness-120' },
    { name: 'Perpetua', className: 'filter-contrast-110 filter-brightness-125' },
    { name: 'Amaro', className: 'filter-hue-rotate-[-10deg] filter-contrast-90 filter-saturate-150' },
    { name: 'Mayfair', className: 'filter-contrast-110 filter-saturate-110' },
    { name: 'Rise', className: 'filter-brightness-105 filter-sepia-[0.2] filter-contrast-90 filter-saturate-90' },
    { name: 'Hudson', className: 'filter-brightness-120 filter-contrast-90 filter-saturate-110' },
    { name: 'Valencia', className: 'filter-contrast-110 filter-sepia-[0.08]' },
    { name: 'X-Pro II', className: 'filter-contrast-150 filter-saturate-180' },
    { name: 'Sierra', className: 'filter-contrast-90 filter-saturate-125' },
    { name: 'Willow', className: 'filter-grayscale filter-contrast-95' },
    { name: 'Lo-Fi', className: 'filter-saturate-110 filter-contrast-150' },
    { name: 'Inkwell', className: 'filter-grayscale filter-contrast-110 filter-brightness-110' },
    { name: 'Hefe', className: 'filter-contrast-110 filter-saturate-140' },
    { name: 'Nashville', className: 'filter-sepia-[0.2] filter-contrast-120 filter-brightness-[0.9] filter-hue-rotate-[-15deg]' },
];


type AspectRatio = "1:1" | "4:5" | "16:9";

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
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  
  const [step, setStep] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('filter-none');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");

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

  const onSubmit: SubmitHandler<PostFormInputs> = async (data) => {
    if (!user || !firestore || !storage || !userProfile) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Votre profil n\'est pas chargé. Veuillez patienter.' });
      return;
    }
    if (!imageFile) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Une image est requise pour la publication." });
        return;
    }
    setLoading(true);
    toast({ title: 'Publication en cours...', description: 'Votre publication apparaîtra dans le fil.' });

    const newDocRef = doc(collection(firestore, 'posts'));
    const imageRef = storageRef(storage, `posts/${newDocRef.id}/${imageFile.name}`);

    try {
        const snapshot = await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

        const postData = {
            ...data,
            id: newDocRef.id,
            userId: user.uid,
            username: userProfile.username,
            userAvatarUrl: userProfile.profilePicture,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            likes: [],
            comments: [],
            imageUrl: imageUrl,
        };

        await setDoc(newDocRef, postData);
        
        toast({ title: 'Succès', description: 'Publication créée !' });
        onClose();
        router.refresh();

    } catch (error: any) {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: newDocRef.path,
                operation: 'create',
                requestResourceData: data,
            })
        );
        toast({ variant: 'destructive', title: 'Erreur de publication', description: "Impossible de créer la publication. Vérifiez vos permissions." });
    } finally {
        setLoading(false);
    }
  };

  const aspectClasses: Record<AspectRatio, string> = {
    "1:1": "aspect-square",
    "4:5": "aspect-w-4 aspect-h-5",
    "16:9": "aspect-video",
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="p-3 pb-0 border-b text-center relative flex justify-between items-center flex-row">
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
        <form>
          {step === 1 && (
             <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
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
             <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] min-h-[60vh]">
                  <div className="flex items-center justify-center border-r bg-black">
                     <div className={cn("relative w-full h-full max-h-[calc(80vh-53px)]", aspectClasses[aspectRatio])}>
                        <div className="absolute top-2 left-2 z-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="icon" className="rounded-full h-8 w-8 bg-black/50 hover:bg-black/70 text-white">
                                <Crop className="h-4 w-4"/>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => setAspectRatio("1:1")}>Carré (1:1)</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAspectRatio("4:5")}>Portrait (4:5)</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setAspectRatio("16:9")}>Paysage (16:9)</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <Image src={previewUrl} alt="Aperçu" layout="fill" objectFit="contain" className={cn("transition-all", selectedFilter)} />
                      </div>
                  </div>
                  
                  <Tabs defaultValue="filters" className="flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                        <TabsTrigger value="filters" className="rounded-none shadow-none data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none -mb-px">Filtres</TabsTrigger>
                        <TabsTrigger value="caption" className="rounded-none shadow-none data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none -mb-px">Légende</TabsTrigger>
                    </TabsList>
                    <TabsContent value="filters" className="flex-grow p-4 overflow-y-auto">
                        <div className="grid grid-cols-3 gap-2">
                            {filters.map(filter => (
                                <div key={filter.name} onClick={() => setSelectedFilter(filter.className)} className="cursor-pointer">
                                    <div className={cn("relative aspect-square rounded-md overflow-hidden ring-2 ring-offset-2 ring-offset-background", selectedFilter === filter.className ? 'ring-primary' : 'ring-transparent')}>
                                        <Image src={previewUrl} alt={filter.name} layout="fill" objectFit="cover" className={filter.className} />
                                    </div>
                                    <p className="text-xs text-center mt-1">{filter.name}</p>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="caption" className="flex-grow flex flex-col p-4">
                        {userProfile && (
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src={userProfile.profilePicture ?? undefined} />
                                    <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                                </Avatar>
                                <p className="font-semibold text-sm">{userProfile.username}</p>
                            </div>
                        )}
                        <div className="flex-grow">
                            <Textarea
                                id="caption"
                                {...register('caption')}
                                placeholder="Écrivez une légende..."
                                className="text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none min-h-[100px]"
                            />
                            {errors.caption && <p className="text-xs text-destructive mt-2">{errors.caption.message}</p>}
                        </div>

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
                    </TabsContent>
                  </Tabs>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
