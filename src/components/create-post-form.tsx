
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
import { useFirestore, useUser, useStorage, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import Image from 'next/image';
import { Image as ImageIcon, ArrowLeft, Crop } from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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
    { name: 'Grayscale', className: 'filter-grayscale' },
    { name: 'Sepia', className: 'filter-sepia' },
    { name: 'Saturate', className: 'filter-saturate' },
    { name: 'Contrast', className: 'filter-contrast' },
    { name: 'Brightness', className: 'filter-brightness' },
    { name: 'Hue-Rotate', className: 'filter-hue-rotate' },
    { name: 'Invert', className: 'filter-invert' },
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

  const onSubmit: SubmitHandler<PostFormInputs> = (data) => {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour poster.' });
      return;
    }
    if (!imageFile) {
        toast({ variant: 'destructive', title: 'Erreur', description: "Une image est requise pour la publication." });
        return;
    }
    setLoading(true);

    const newDocRef = doc(collection(firestore, 'posts'));
    const imageRef = storageRef(storage, `posts/${newDocRef.id}/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(imageRef, imageFile);

    toast({ title: 'Publication en cours...', description: 'Votre publication apparaîtra dans le fil.' });

    uploadTask.on('state_changed',
        (snapshot) => {
            // Optional: handle progress
        },
        (error) => {
            console.error("Upload error:", error);
            setLoading(false);
            toast({ variant: 'destructive', title: 'Erreur de téléversement', description: "Impossible de téléverser l'image." });
        },
        async () => {
            try {
                const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
                const postData = {
                    ...data,
                    id: newDocRef.id,
                    userId: user.uid,
                    username: user.displayName?.split(' ')[0] || user.email?.split('@')[0],
                    userAvatarUrl: user.photoURL,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    likes: [],
                    comments: [],
                    imageUrl: imageUrl,
                };
                
                // This is the critical change: wrap setDoc in a try/catch
                await setDoc(newDocRef, postData);
                
                toast({ title: 'Succès', description: 'Publication créée !' });
                onClose();

            } catch (err) {
                 const permissionError = new FirestorePermissionError({
                    path: newDocRef.path,
                    operation: 'create',
                    requestResourceData: data,
                });
                errorEmitter.emit('permission-error', permissionError);
                setLoading(false);
            }
        }
    );
  };

  const aspectClasses: Record<AspectRatio, string> = {
    "1:1": "aspect-square",
    "4:5": "aspect-[4/5]",
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
              <Button variant="link" onClick={handleSubmit(onSubmit)} className="ml-auto p-0 h-auto font-bold" disabled={loading}>
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
                  <div className={cn("flex flex-col items-center justify-center border-r bg-black relative", aspectClasses[aspectRatio])}>
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
                  
                  <Tabs defaultValue="filters" className="flex flex-col">
                    <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
                        <TabsTrigger value="filters" className="rounded-none shadow-none data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none -mb-px">Filtres</TabsTrigger>
                        <TabsTrigger value="caption" className="rounded-none shadow-none data-[state=active]:border-b-2 border-primary data-[state=active]:shadow-none -mb-px">Légende</TabsTrigger>
                    </TabsList>
                    <TabsContent value="filters" className="flex-grow p-4">
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
                        {user && (
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src={user.photoURL ?? undefined} />
                                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                </Avatar>
                                <p className="font-semibold text-sm">{user.displayName?.split(' ')[0]}</p>
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
