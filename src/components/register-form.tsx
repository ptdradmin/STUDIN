
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const universities = [
    'Université de Namur',
    'Université de Liège',
    'UCLouvain',
    'ULB - Université Libre de Bruxelles',
    'UMons',
    'HEC Liège',
    'Autre'
];

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);


export default function RegisterForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    university: '',
    field_of_study: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { auth } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, university: value });
  };

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            university: '',
            fieldOfStudy: '',
        });
      }

      toast({
        title: "Connexion réussie!",
        description: "Bienvenue sur STUD'IN.",
      });
      router.push('/social');

    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Erreur d'authentification",
            description: "Impossible de se connecter avec Google.",
        });
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Les mots de passe ne correspondent pas.",
        });
        return;
    }
    setLoading(true);
    
    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Le service d'authentification n'est pas disponible.",
        });
        setLoading(false);
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        const displayName = `${formData.first_name} ${formData.last_name}`;

        await updateProfile(user, {
            displayName: displayName
        });

        // Save additional user info to Firestore
        const userDocRef = doc(firestore, 'users', user.uid);
        await setDoc(userDocRef, {
            id: user.uid,
            email: user.email,
            displayName: displayName,
            university: formData.university,
            fieldOfStudy: formData.field_of_study,
            photoURL: user.photoURL
        });


        toast({
            title: "Inscription réussie!",
            description: "Votre compte a été créé. Vous êtes maintenant connecté.",
        });
        router.push('/social');
    } catch (error: any) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Erreur d'inscription",
            description: "Impossible de créer le compte. L'email est peut-être déjà utilisé.",
        });
    } finally {
        setLoading(false);
    }
  };

  const passwordsMatch = formData.password === formData.confirm_password;

  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Inscription</CardTitle>
        <CardDescription>Rejoignez la communauté STUD'IN</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            S'inscrire avec Google
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou s'inscrire avec un e-mail</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input id="first_name" name="first_name" placeholder="Jean" required onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input id="last_name" name="last_name" placeholder="Dupont" required onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="votre.email@example.com" required onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input id="password" name="password" type="password" placeholder="Minimum 6 caractères" required minLength={6} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                <Input id="confirm_password" name="confirm_password" type="password" placeholder="••••••••" required onChange={handleChange} />
              </div>
            </div>
            {!passwordsMatch && formData.confirm_password && (
              <p className="text-xs text-destructive">Les mots de passe ne correspondent pas.</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="university">Université</Label>
              <Select name="university" onValueChange={handleSelectChange}>
                  <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez votre université" />
                  </SelectTrigger>
                  <SelectContent>
                      {universities.map(uni => (
                          <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="field_of_study">Domaine d'études</Label>
              <Input id="field_of_study" name="field_of_study" placeholder="Ex: Informatique, Droit, Médecine..." onChange={handleChange} />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !passwordsMatch || !formData.password}>
              {loading ? 'Inscription en cours...' : "S'inscrire"}
            </Button>
          </form>
        </div>
      </CardContent>
       <CardFooter className="flex justify-center">
         <p className="text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Connectez-vous
            </Link>
          </p>
      </CardFooter>
    </Card>
  );
}
