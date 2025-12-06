
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useAuth, useStorage, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import type { User as FirebaseUser } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { UserProfile } from '@/lib/types';
import { updateUserPosts } from '@/lib/actions';
import { generateAvatar, getInitials } from '@/lib/avatars';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { schoolsList } from '@/lib/static-data';
import FormSection from './form-section';


const studentProfileSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.").regex(/^[a-zA-Z0-9_.]+$/, "Caractères non valides").transform(val => val.toLowerCase()),
  university: z.string().min(1, "L'établissement est requis"),
  fieldOfStudy: z.string().min(1, "Le domaine d'études est requis"),
  postalCode: z.string().min(4, 'Code postal invalide'),
  city: z.string().min(1, 'La ville est requise'),
  bio: z.string().max(150, "La bio ne peut pas dépasser 150 caractères").optional(),
  website: z.string().url("Veuillez entrer une URL valide").optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
});

const institutionProfileSchema = z.object({
    // 'firstName' on UserProfile is the institution name
    firstName: z.string().min(1, "Le nom de l'institution est requis"),
    username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.").regex(/^[a-zA-Z0-9_.]+$/, "Caractères non valides").transform(val => val.toLowerCase()),
    postalCode: z.string().min(4, 'Code postal invalide'),
    city: z.string().min(1, 'La ville est requise'),
    bio: z.string().max(150, "La bio ne peut pas dépasser 150 caractères").optional(),
    website: z.string().url("Veuillez entrer une URL valide").optional().or(z.literal('')),
});


type StudentProfileInputs = z.infer<typeof studentProfileSchema>;
type InstitutionProfileInputs = z.infer<typeof institutionProfileSchema>;
type ProfileFormInputs = StudentProfileInputs | InstitutionProfileInputs;


interface EditProfileFormProps {
  user: FirebaseUser;
  userProfile: UserProfile;
  onClose: () => void;
}

const avatarStyles = [
  'micah',
  'bottts',
  'adventurer',
  'fun-emoji',
  'lorelei',
  'notionists',
  'identicon',
  'initials',
  'avataaars',
  'big-smile',
  'personas',
  'pixel-art',
];

export default function EditProfileForm({ user, userProfile, onClose }: EditProfileFormProps) {
  const isInstitution = userProfile.role === 'institution';

  const { register, handleSubmit, control, formState: { errors } } = useForm<ProfileFormInputs>({
    resolver: zodResolver(isInstitution ? institutionProfileSchema : studentProfileSchema),
    defaultValues: {
        firstName: userProfile?.firstName || '',
        lastName: userProfile?.lastName || '',
        username: userProfile?.username || '',
        university: userProfile?.university || '',
        fieldOfStudy: userProfile?.fieldOfStudy || '',
        postalCode: userProfile?.postalCode || '',
        city: userProfile?.city || '',
        bio: userProfile?.bio || '',
        website: userProfile?.website || '',
        gender: userProfile?.gender,
    }
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const storage = useStorage();
  const { auth } = useAuth();
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

  const handleAvatarSelect = (avatarUrl: string) => {
    setPreviewUrl(avatarUrl);
    setProfilePictureFile(null); // Clear file if an avatar is selected
  }
  
  const onSubmit: SubmitHandler<ProfileFormInputs> = async (data) => {
    if (!user || !firestore || !storage || !auth) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le service est indisponible.' });
      return;
    }
    setLoading(true);
    
    let newPhotoURL = userProfile.profilePicture;

    if (profilePictureFile) {
        const fileRef = storageRef(storage, `users/${user.uid}/profile.jpg`);
        await uploadBytes(fileRef, profilePictureFile);
        newPhotoURL = await getDownloadURL(fileRef);
    } else if (previewUrl && previewUrl !== userProfile.profilePicture) {
        newPhotoURL = previewUrl;
    }

    const userDocRef = doc(firestore, 'users', user.uid);
    const dataToUpdate = { ...data, profilePicture: newPhotoURL, updatedAt: serverTimestamp() };
    const batch = writeBatch(firestore);

    batch.update(userDocRef, dataToUpdate);

    if (isInstitution) {
        const institutionDocRef = doc(firestore, 'institutions', user.uid);
        batch.update(institutionDocRef, {
            name: data.firstName,
            postalCode: (data as InstitutionProfileInputs).postalCode,
            city: (data as InstitutionProfileInputs).city
        });
    }

    const hasProfileChanged = data.username !== userProfile.username || newPhotoURL !== userProfile.profilePicture;
    if (hasProfileChanged) {
        await updateUserPosts(firestore, user.uid, { username: data.username, userAvatarUrl: newPhotoURL }, batch);
    }
    
    batch.commit().then(async () => {
         const displayName = isInstitution ? data.firstName : `${data.firstName} ${(data as StudentProfileInputs).lastName}`;
        const currentUser = auth.currentUser;
        if (currentUser && (currentUser.displayName !== displayName || currentUser.photoURL !== newPhotoURL)) {
            await updateProfile(currentUser, { displayName, photoURL: newPhotoURL });
        }
        toast({ title: 'Succès', description: 'Profil mis à jour !' });
        onClose();
        setLoading(false);
    }).catch((error) => {
        const permissionError = new FirestorePermissionError({
            path: `users/${user.uid}`,
            operation: 'update',
            requestResourceData: dataToUpdate,
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
    });
  };

  const studentErrors = errors as z.ZodError<StudentProfileInputs>['formErrors']['fieldErrors'];
  const institutionErrors = errors as z.ZodError<InstitutionProfileInputs>['formErrors']['fieldErrors'];

  const generatedAvatars = avatarStyles.map(style => `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(user.email || user.uid)}`);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>
            Gérez vos informations personnelles et publiques.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
             <FormSection title="Profil Public" description="Ces informations seront visibles par les autres utilisateurs.">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={previewUrl || generateAvatar(user.email || user.uid)} />
                        <AvatarFallback>{getInitials(userProfile?.firstName)}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col gap-2">
                        <Label htmlFor="photo-upload" className="cursor-pointer">
                            <Button type="button" variant="outline" asChild>
                                <span className="w-full text-center">Changer la photo</span>
                            </Button>
                        </Label>
                        <Input id="photo-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange}/>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline">Générer un avatar</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96">
                                <div className="grid grid-cols-6 gap-2">
                                    {generatedAvatars.map((avatarUrl, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleAvatarSelect(avatarUrl)}
                                            className={cn("rounded-full ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", previewUrl === avatarUrl && 'ring-2 ring-primary')}
                                        >
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={avatarUrl} />
                                            </Avatar>
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                     </div>
                </div>
                 <div>
                    <Label htmlFor="username">Nom d'utilisateur</Label>
                    <Input id="username" {...register('username')} />
                    {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" {...register('bio')} placeholder="Parlez un peu de vous..." />
                     {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="website">Lien</Label>
                    <Input id="website" {...register('website')} placeholder="https://votre-site.com" />
                    {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
                </div>
             </FormSection>

             <FormSection title={isInstitution ? "Informations sur l'institution" : "Informations Privées"} description={isInstitution ? "Détails sur votre organisation." : "Ces informations ne seront pas visibles publiquement."}>
                {isInstitution ? (
                    <>
                        <div>
                            <Label htmlFor="firstName">Nom de l'institution</Label>
                            <Input id="firstName" {...register('firstName')} />
                            {institutionErrors.firstName && <p className="text-xs text-destructive">{institutionErrors.firstName.message}</p>}
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="postalCode">Code Postal</Label>
                                <Input id="postalCode" {...register('postalCode')} />
                                {institutionErrors.postalCode && <p className="text-xs text-destructive">{institutionErrors.postalCode.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="city">Ville</Label>
                                <Input id="city" {...register('city')} />
                                {institutionErrors.city && <p className="text-xs text-destructive">{institutionErrors.city.message}</p>}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">Prénom</Label>
                                <Input id="firstName" {...register('firstName')} />
                                {studentErrors.firstName && <p className="text-xs text-destructive">{studentErrors.firstName.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="lastName">Nom</Label>
                                <Input id="lastName" {...register('lastName')} />
                                {studentErrors.lastName && <p className="text-xs text-destructive">{studentErrors.lastName.message}</p>}
                            </div>
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
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="postalCode">Code Postal</Label>
                                <Input id="postalCode" {...register('postalCode')} />
                                {studentErrors.postalCode && <p className="text-xs text-destructive">{studentErrors.postalCode.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="city">Ville</Label>
                                <Input id="city" {...register('city')} />
                                {studentErrors.city && <p className="text-xs text-destructive">{studentErrors.city.message}</p>}
                            </div>
                        </div>
                    </>
                )}
             </FormSection>

            {!isInstitution && (
                <FormSection title="Informations Académiques">
                    <div>
                        <Label htmlFor="university">Établissement</Label>
                        <Controller
                            name="university"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue placeholder="Sélectionnez votre établissement" /></SelectTrigger>
                                    <SelectContent>
                                        {schoolsList.map(uni => (
                                            <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {studentErrors.university && <p className="text-xs text-destructive">{studentErrors.university.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="fieldOfStudy">Domaine d'études</Label>
                        <Input id="fieldOfStudy" {...register('fieldOfStudy')} />
                        {studentErrors.fieldOfStudy && <p className="text-xs text-destructive">{studentErrors.fieldOfStudy.message}</p>}
                    </div>
                </FormSection>
            )}

          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder les changements'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    