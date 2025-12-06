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
import { useAuth, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
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
  const { auth } = useAuth();
  const firestore = useFirestore();
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

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Service indisponible. Veuillez réessayer.' });
      setLoading(false);
      return;
    }

    try {
        const username = data.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.]/g, '').substring(0, 20) || `institution_${new Date().getTime()}`;
            
        const usernameIsUnique = await isUsernameUnique(firestore, username);
        if (!usernameIsUnique) {
            form.setError("name", {
                type: "manual",
                message: "Ce nom est déjà pris ou génère un nom d'utilisateur existant.",
            });
            setLoading(false);
            return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        
        const newDisplayName = data.name;
        const newPhotoURL = generateAvatar(userCredential.user.email || userCredential.user.uid);
        await updateProfile(userCredential.user, { displayName: newDisplayName, photoURL: newPhotoURL });
        
        // The user document creation is now handled by the onAuthStateChanged listener in FirebaseProvider
        
        toast({
            title: "Compte créé !",
            description: "Votre compte partenaire a été créé avec succès.",
        });
        router.push('/social');

    } catch (error: any) {
        let description = "Impossible de créer le compte. Veuillez réessayer.";
        
          switch (error.code) {
            case 'auth/email-already-in-use':
              description = "Cet e-mail est déjà utilisé. Veuillez vous connecter ou utiliser une autre adresse.";
              break;
            case 'auth/weak-password':
              description = "Le mot de passe est trop faible. Veuillez en choisir un plus sécurisé.";
              break;
            case 'auth/invalid-email':
              description = "L'adresse e-mail n'est pas valide.";
              break;
            case 'auth/network-request-failed':
                description = "Erreur de réseau. Veuillez vérifier votre connexion internet.";
                break;
             case 'permission-denied':
                 const permissionError = new FirestorePermissionError({
                    path: `users/${auth.currentUser?.uid}`, // Approximate path for context
                    operation: 'create',
                    requestResourceData: { role: 'institution', email: data.email },
                });
                errorEmitter.emit('permission-error', permissionError);
                return; // Stop execution
            default:
                description = `Une erreur inattendue est survenue. (${error.code})`;
          }
          toast({
            variant: "destructive",
            title: "Erreur d'inscription",
            description: description,
          });
    } finally {
        setLoading(false);
    }
  };

  const buttonsDisabled = loading;

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
                    <Input placeholder="Ex: Ville de Bruxelles, ASBL..." {...field} disabled={buttonsDisabled} />
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
                      <Input placeholder="1000" {...field} disabled={buttonsDisabled} />
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
                      <Input placeholder="Bruxelles" {...field} disabled={buttonsDisabled} />
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
                    <Input type="email" placeholder="contact@votreinstitution.org" {...field} disabled={buttonsDisabled} />
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
                        <Input type={showPassword ? 'text' : 'password'} placeholder="6+ caractères" {...field} disabled={buttonsDisabled} className="pr-10" />
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
                        <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="6+ caractères" {...field} disabled={buttonsDisabled} className="pr-10" />
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

            <Button type="submit" className="w-full" disabled={buttonsDisabled}>
              {buttonsDisabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Création..." : "S'inscrire"}
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
