
'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import type { User as FirebaseUser } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { UserProfile } from '@/lib/types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  username: z.string().min(1, "Le nom d'utilisateur est requis").regex(/^[a-zA-Z0-9_.]+$/, "Caractères non valides"),
  university: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  bio: z.string().max(150, "La bio ne peut pas dépasser 150 caractères").optional(),
  website: z.string().url("Veuillez entrer une URL valide").optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
  profilePicture: z.string().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

const universities = [
    'Université de Namur',
    'Université de Liège',
    'UCLouvain',
    'ULB - Université Libre de Bruxelles',
    'UMons',
    'HEC Liège',
    'Autre'
];


interface EditProfileFormProps {
  user: FirebaseUser;
  userProfile: UserProfile;
  onClose: () => void;
}

export default function EditProfileForm({ user, userProfile, onClose }: EditProfileFormProps) {
  const { register, handleSubmit, control, formState: { errors }, reset, setValue, watch } = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        username: userProfile?.username || '',
        university: userProfile?.university || '',
        fieldOfStudy: userProfile?.fieldOfStudy || '',
        bio: userProfile?.bio || '',
        website: userProfile?.website || '',
        gender: userProfile?.gender,
        profilePicture: userProfile?.profilePicture,
    }
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(userProfile?.profilePicture);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setProfilePictureFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        }
        reader.readAsDataURL(file);
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return "..";
    const parts = name.split(' ');
    if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  
  const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }
    setLoading(true);
    
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      let newPhotoURL = userProfile.profilePicture;

      if (profilePictureFile) {
        const storage = getStorage();
        const fileRef = storageRef(storage, `users/${user.uid}/profile.jpg`);
        await uploadBytes(fileRef, profilePictureFile);
        newPhotoURL = await getDownloadURL(fileRef);
      }
      
      const dataToUpdate: any = {
        ...data,
        profilePicture: newPhotoURL,
        updatedAt: serverTimestamp()
      };
      
      Object.keys(dataToUpdate).forEach(keyStr => {
        const key = keyStr as keyof typeof dataToUpdate;
        if (dataToUpdate[key] === undefined) {
          delete dataToUpdate[key];
        }
      });
      
      await updateDoc(userDocRef, dataToUpdate);
      
      const displayName = `${data.firstName} ${data.lastName}`;
      if(user.displayName !== displayName || user.photoURL !== newPhotoURL) {
        await updateProfile(user, { 
            displayName,
            photoURL: newPhotoURL,
        });
      }

      toast({ title: 'Succès', description: 'Profil mis à jour !' });
      onClose();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible de mettre à jour le profil." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={previewUrl || undefined} />
                    <AvatarFallback>{getInitials(userProfile?.firstName)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{userProfile.username}</p>
                    <Label htmlFor="photo-upload" className="text-sm text-primary cursor-pointer hover:underline">
                        Changer la photo de profil
                    </Label>
                    <Input id="photo-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange}/>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
            </div>
             <div>
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input id="username" {...register('username')} />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
             <div>
                <Label htmlFor="website">Lien</Label>
                <Input id="website" {...register('website')} placeholder="https://votre-site.com" />
                {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" {...register('bio')} placeholder="Parlez un peu de vous..." />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>
            
            <div>
                <Label htmlFor="gender">Genre</Label>
                <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner le genre" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="female">Femme</SelectItem>
                                <SelectItem value="male">Homme</SelectItem>
                                <SelectItem value="non-binary">Non-binaire</SelectItem>
                                <SelectItem value="prefer-not-to-say">Ne pas spécifier</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>

            <div>
              <Label htmlFor="university">Université</Label>
               <Controller
                    name="university"
                    control={control}
                    render={({ field }) => (
                         <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Sélectionnez votre université" /></SelectTrigger>
                            <SelectContent>
                                {universities.map(uni => (
                                    <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
               {errors.university && <p className="text-xs text-destructive">{errors.university.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="fieldOfStudy">Domaine d'études</Label>
              <Input id="fieldOfStudy" {...register('fieldOfStudy')} />
              {errors.fieldOfStudy && <p className="text-xs text-destructive">{errors.fieldOfStudy.message}</p>}
            </div>

          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
