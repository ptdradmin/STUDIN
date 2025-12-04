
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, writeBatch, query, collection, where, getDocs } from 'firebase/firestore';
import { Eye, EyeOff } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { generateAvatar } from '@/lib/avatars';
import Link from 'next/link';
import { isUsernameUnique } from '@/lib/user-actions';

const registerSchema = z.object({
  name: z.string().min(1, "Le nom de l'institution est requis"),
  postalCode: z.string().min(4, 'Code postal invalide'),
  city: z.string().min(1, 'La ville est requise'),
  email: z.string().email("L'adresse e-mail n'est pas valide"),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;


export default function RegisterInstitutionForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { auth, firestore, isUserLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      postalCode: '',
      city: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const createUserDocuments = async (user: User, data: RegisterFormValues) => {
    if (!firestore) return;

    const batch = writeBatch(firestore);

    // 1. User Document
    const userDocRef = doc(firestore, 'users', user.uid);
    
    let username = data.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.]/g, '').substring(0, 20);
    let isUnique = await isUsernameUnique(firestore, username);
    let counter = 1;
    while(!isUnique) {
        const newUsername = `${username}${counter}`;
        isUnique = await isUsernameUnique(firestore, newUsername);
        if (isUnique) {
            username = newUsername;
        }
        counter++;
    }

    const userData = {
        id: user.uid,
        role: 'institution',
        username: username,
        email: data.email,
        firstName: data.name, // Use institution name as firstName for consistency
        lastName: '', // No last name for institution
        university: '', // Not applicable
        fieldOfStudy: '', // Not applicable
        postalCode: data.postalCode,
        city: data.city,
        bio: `Compte officiel de ${data.name}.`,
        website: '',
        profilePicture: generateAvatar(user.email || user.uid),
        followerIds: [],
        followingIds: [],
        isVerified: true, // Institutions are auto-verified for now
        points: 0,
        challengesCompleted: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    batch.set(userDocRef, userData);

    // 2. Institution Document
    const institutionDocRef = doc(firestore, 'institutions', user.uid);
    const institutionData = {
        id: user.uid,
        userId: user.uid,
        name: data.name,
        postalCode: data.postalCode,
        city: data.city,
        email: data.email,
        role: 'institution',
        createdAt: serverTimestamp(),
    };
    batch.set(institutionDocRef, institutionData);
    
    await batch.commit();

    // 3. Update Auth Profile
    if (user) {
        await updateProfile(user, { displayName: data.name, photoURL: userData.profilePicture });
    }
  };

  const handleSuccess = () => {
     toast({
        title: "Inscription réussie !",
        description: "Votre compte partenaire a été créé.",
      });
      router.push('/dashboard');
      router.refresh();
  };

  const handleError = (error: any) => {
      let description = "Impossible de créer le compte.";
      if (error.code === 'auth/email-already-in-use') {
          description = "Cet email est déjà utilisé pour un autre compte.";
      }
      toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description,
      });
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    
    if (!auth || !firestore) {
        toast({ variant: "destructive", title: "Erreur", description: "Service indisponible." });
        setLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await createUserDocuments(userCredential.user, data);
      handleSuccess();
    } catch (error: any) {
        handleError(error);
    } finally {
        setLoading(false);
    }
  };

  const servicesReady = !!auth && !!firestore && !isUserLoading;

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Compte Partenaire</CardTitle>
        <CardDescription>Inscrivez votre institution sur STUD'IN</CardDescription>
      </CardHeader>
      <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'institution</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ville de Bruxelles, ASBL..." {...field} disabled={!servicesReady} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code Postal</FormLabel>
                      <FormControl>
                        <Input placeholder="1000" {...field} disabled={!servicesReady} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ville</FormLabel>
                      <FormControl>
                        <Input placeholder="Bruxelles" {...field} disabled={!servicesReady} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de contact</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="contact@votreinstitution.org" {...field} disabled={!servicesReady} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? 'text' : 'password'} placeholder="6+ caractères" {...field} disabled={!servicesReady} className="pr-10"/>
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                           <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="6+ caractères" {...field} disabled={!servicesReady} className="pr-10"/>
                           <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading || !servicesReady}>
                {loading ? "Création du compte..." : "S'inscrire"}
              </Button>
            </form>
          </Form>
      </CardContent>
       <CardFooter className="flex justify-center">
         <p className="text-sm text-muted-foreground">
            Vous êtes étudiant ?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Inscrivez-vous ici
            </Link>
          </p>
      </CardFooter>
    </>
  );
}
