
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
import { useAuth } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, OAuthProvider, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Eye, EyeOff } from 'lucide-react';

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
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

const MicrosoftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="21" height="21" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M1 1H10V10H1V1Z" fill="#f25022"/>
        <path d="M11 1H20V10H11V1Z" fill="#7fba00"/>
        <path d="M1 11H10V20H1V11Z" fill="#00a4ef"/>
        <path d="M11 11H20V20H11V11Z" fill="#ffb900"/>
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(''); // can be 'google', 'microsoft', 'email'
  const router = useRouter();
  const { auth, firestore, isUserLoading } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, university: value });
  };
  
  const createUserDocument = async (user: User, additionalData: any = {}) => {
      if (!firestore) return;
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const { email, displayName, photoURL } = user;
        const [firstNameFromProvider, lastNameFromProvider] = displayName?.split(' ') || ['', ''];

        const firstName = additionalData.firstName || firstNameFromProvider;
        const lastName = additionalData.lastName || lastNameFromProvider;
        const username = additionalData.username || email?.split('@')[0] || `user_${user.uid.substring(0,6)}`;

        const userData = {
            id: user.uid,
            email,
            username,
            firstName,
            lastName,
            university: additionalData.university || '',
            fieldOfStudy: additionalData.fieldOfStudy || '',
            profilePicture: photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${email}`,
            followerIds: [],
            followingIds: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };
        await setDoc(userDocRef, userData, { merge: true });
      }
  }

  const handleSuccess = () => {
     toast({
        title: "Inscription réussie!",
        description: "Bienvenue sur STUD'IN. Vous êtes maintenant connecté.",
      });
      router.push('/social');
  }

  const handleError = (error: any) => {
      let description = "Impossible de créer le compte.";
      if (error.code === 'auth/email-already-in-use') {
          description = "Cet email est déjà utilisé. Essayez de vous connecter.";
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
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
      handleSuccess();
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading('');
    }
  };

  const handleMicrosoftSignIn = async () => {
    if (!auth || !firestore) return;
    setLoading('microsoft');
    const provider = new OAuthProvider('microsoft.com');
    try {
        const result = await signInWithPopup(auth, provider);
        await createUserDocument(result.user);
        handleSuccess();
    } catch (error: any) {
        handleError(error);
    } finally {
        setLoading('');
    }
  }


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
    setLoading('email');
    
    if (!auth || !firestore) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Le service d'authentification n'est pas disponible.",
        });
        setLoading('');
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        const displayName = `${formData.first_name} ${formData.last_name}`;

        await updateProfile(user, { displayName });

        await createUserDocument(user, {
            firstName: formData.first_name,
            lastName: formData.last_name,
            username: formData.email.split('@')[0],
            university: formData.university,
            fieldOfStudy: formData.field_of_study
        });
        handleSuccess();
    } catch (error: any) {
        handleError(error);
    } finally {
        setLoading('');
    }
  };

  const passwordsMatch = formData.password === formData.confirm_password;
  const servicesReady = !!auth && !!firestore && !isUserLoading;

  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Inscription</CardTitle>
        <CardDescription>Rejoignez la communauté STUD'IN</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={!!loading || !servicesReady}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Google
              </Button>
               <Button variant="outline" className="w-full" onClick={handleMicrosoftSignIn} disabled={!!loading || !servicesReady}>
                <MicrosoftIcon className="mr-2 h-4 w-4" />
                Microsoft
              </Button>
           </div>
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
                <Input id="first_name" name="first_name" placeholder="Jean" required onChange={handleChange} disabled={!servicesReady} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input id="last_name" name="last_name" placeholder="Dupont" required onChange={handleChange} disabled={!servicesReady} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="votre.email@example.com" required onChange={handleChange} disabled={!servicesReady} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Minimum 6 caractères" 
                    required minLength={6} 
                    onChange={handleChange} 
                    disabled={!servicesReady} 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
                 <div className="relative">
                  <Input 
                    id="confirm_password" 
                    name="confirm_password" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••" 
                    required 
                    onChange={handleChange} 
                    disabled={!servicesReady}
                    className="pr-10"
                  />
                   <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
            {!passwordsMatch && formData.confirm_password && (
              <p className="text-xs text-destructive">Les mots de passe ne correspondent pas.</p>
            )}

            <div className="space-y-2">
              <Label htmlFor="university">Université</Label>
              <Select name="university" onValueChange={handleSelectChange} disabled={!servicesReady}>
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
              <Input id="field_of_study" name="field_of_study" placeholder="Ex: Informatique, Droit, Médecine..." onChange={handleChange} disabled={!servicesReady} />
            </div>
            <Button type="submit" className="w-full" disabled={!!loading || !passwordsMatch || !formData.password || !servicesReady}>
              {loading === 'email' ? 'Inscription en cours...' : "S'inscrire"}
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

    