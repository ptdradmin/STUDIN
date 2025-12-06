
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import Link from 'next/link';
import { isUsernameUnique } from '@/lib/user-actions';
import { schoolsList } from '@/lib/static-data';
import { generateAvatar } from '@/lib/avatars';

const registerSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.").regex(/^[a-z0-9_.]+$/, "Nom d'utilisateur invalide. Utilisez uniquement des minuscules, chiffres, points ou underscores.").transform(val => val.toLowerCase()),
  email: z.string().email("L'adresse e-mail n'est pas valide"),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
  postalCode: z.string().min(4, 'Code postal invalide'),
  city: z.string().min(1, 'La ville est requise'),
  university: z.string().min(1, "L'établissement est requis"),
  fieldOfStudy: z.string().min(1, "Le domaine d'études est requis"),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;


export default function RegisterForm() {
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
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      postalCode: '',
      city: '',
      university: '',
      fieldOfStudy: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);

    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Le service est indisponible. Veuillez réessayer.' });
      setLoading(false);
      return;
    }

    try {
      const usernameIsUnique = await isUsernameUnique(firestore, data.username);
      if (!usernameIsUnique) {
        form.setError("username", {
          type: "manual",
          message: "Ce nom d'utilisateur est déjà pris.",
        });
        setLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      const newDisplayName = `${data.firstName} ${data.lastName}`.trim();
      const newPhotoURL = generateAvatar(user.email || user.uid);
      await updateProfile(user, { displayName: newDisplayName, photoURL: newPhotoURL });

      // The FirebaseProvider will now handle creating the Firestore document.
      
      toast({
        title: "Inscription réussie!",
        description: "Bienvenue sur STUD'IN. Vous allez être redirigé.",
      });

      router.push('/social');
      router.refresh();

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
        <CardTitle className="text-2xl">Inscription Étudiant</CardTitle>
        <CardDescription>Rejoignez la communauté STUD'IN</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean" {...field} disabled={buttonsDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input placeholder="Dupont" {...field} disabled={buttonsDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input placeholder="jean.dupont" {...field} disabled={buttonsDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre.email@example.com" {...field} disabled={buttonsDisabled} />
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
                          <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} disabled={buttonsDisabled} className="pr-10" />
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
                          <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" {...field} disabled={buttonsDisabled} className="pr-10" />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code Postal</FormLabel>
                      <FormControl>
                        <Input placeholder="5000" {...field} disabled={buttonsDisabled} />
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
                        <Input placeholder="Namur" {...field} disabled={buttonsDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Établissement</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={buttonsDisabled}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez votre établissement" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {schoolsList.map(uni => (
                          <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fieldOfStudy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domaine d'études</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Informatique, Droit..." {...field} disabled={buttonsDisabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={buttonsDisabled}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Inscription...' : "S'inscrire"}
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-4">
        <p className="text-sm text-muted-foreground">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Connectez-vous
          </Link>
        </p>
      </CardFooter>
    </>
  );
}
