
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
import { useFirebase } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { createUserDocument } from '@/lib/user-actions';
import Link from 'next/link';

const schoolsList = [
    'Université de Namur', 'Université de Liège', 'UCLouvain', 'ULB - Université Libre de Bruxelles', 'UMons', 'Université Saint-Louis - Bruxelles',
    'HEC Liège', 'HEPL - Haute École de la Province de Liège', 'HELMo - Haute École Libre Mosane',
    'Haute École de la Province de Namur (HEPN)', 'Haute École Louvain en Hainaut (HELHa)', 'Haute École Libre de Bruxelles - Ilya Prigogine (HELB)',
    'Haute École Galilée (HEG)', 'Haute École ICHEC - ECAM - ISFSC', 'Haute École de Bruxelles-Brabant (HE2B)',
    'Haute École Francisco Ferrer', 'Haute École Léonard de Vinci', 'Haute École Robert Schuman',
    'Académie royale des Beaux-Arts de Bruxelles (ArBA-EsA)', 'La Cambre', 'Institut national supérieur des arts du spectacle (INSAS)',
    'École supérieure des Arts Saint-Luc de Bruxelles', "École supérieure des Arts de l'Image 'Le 75'",
    'Arts et Métiers (Campus de Bruxelles)', 'Arts et Métiers (Campus de Charleroi)', 'Campus Provincial de Namur',
    'Institut provincial de Promotion sociale (IPC)', 'EPFC - Promotion Sociale', 'École Industrielle et Commerciale de la Province de Namur (EICPN)',
    'IFAPME - Centre de Namur', 'IFAPME - Centre de Liège', 'IFAPME - Centre de Charleroi', 'IFAPME - Centre de Mons', 'IFAPME - Centre de Wavre',
    'Autre'
];

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


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState('');
  const router = useRouter();
  const { auth, firestore, isUserLoading, areServicesAvailable } = useFirebase();
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

  const handleSuccess = (user: User) => {
     toast({
        title: "Inscription réussie!",
        description: "Bienvenue sur STUD'IN. Vous êtes maintenant connecté.",
      });
      router.push('/social');
      router.refresh();
  }

  const handleError = (error: any) => {
      setLoading('');
      let description = `Impossible de créer le compte. (${error.code})`;
      if (error.code === 'auth/email-already-in-use') {
          description = "Cet email est déjà utilisé. Essayez de vous connecter.";
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        description = "La fenêtre de connexion a été fermée."
      } else if(error.code === 'auth/internal-error') {
        description = `Une erreur interne est survenue. Veuillez réessayer.`
      }
      toast({
          variant: "destructive",
          title: "Erreur d'inscription",
          description,
      });
  }


  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    setLoading('google');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(firestore, result.user);
      handleSuccess(result.user);
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading('');
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    if (!auth || !firestore) {
        toast({ variant: "destructive", title: "Erreur", description: "Le service d'authentification n'est pas disponible." });
        return;
    }
    setLoading('email');
    
    try {
      const isUnique = await createUserDocument(firestore, null, { checkUsername: data.username });
      if (!isUnique) {
          form.setError('username', { type: 'manual', message: "Ce nom d'utilisateur est déjà pris." });
          setLoading('');
          return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await createUserDocument(firestore, userCredential.user, data);
      handleSuccess(userCredential.user);
    } catch (error: any) {
        handleError(error);
    } finally {
        setLoading('');
    }
  };
  
  const buttonsDisabled = !!loading || isUserLoading || !areServicesAvailable;

  return (
    <>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Inscription Étudiant</CardTitle>
        <CardDescription>Rejoignez la communauté STUD'IN</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
           <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={buttonsDisabled}>
                 {buttonsDisabled && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {!isUserLoading && (loading !== 'google' && <GoogleIcon className="mr-2 h-4 w-4" />)}
                {isUserLoading || !areServicesAvailable ? 'Chargement...' : (loading === 'google' ? 'Inscription...' : "S'inscrire avec Google")}
              </Button>
           </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou s'inscrire avec un e-mail</span>
            </div>
          </div>
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
                          <Input type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...field} disabled={buttonsDisabled} className="pr-10"/>
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
                           <Input type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" {...field} disabled={buttonsDisabled} className="pr-10"/>
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
                {buttonsDisabled && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {isUserLoading || !areServicesAvailable ? 'Chargement...' : (loading === 'email' ? 'Inscription en cours...' : "S'inscrire")}
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
