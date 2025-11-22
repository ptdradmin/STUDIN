
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
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const universities = [
    'Université de Namur',
    'Université de Liège',
    'UCLouvain',
    'ULB - Université Libre de Bruxelles',
    'UMons',
    'HEC Liège',
    'Autre'
];

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
