
"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, OAuthProvider, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Eye, EyeOff, GraduationCap } from 'lucide-react';


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(''); // can be 'google', 'microsoft', 'email'
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth, firestore, isUserLoading } = useAuth();
  const { toast } = useToast();

  const createUserDocument = async (user: User) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const { email, displayName, photoURL } = user;
      const [firstName, lastName] = displayName?.split(' ') || ['', ''];
      
      const userData = {
        id: user.uid,
        email,
        firstName,
        lastName,
        university: '',
        fieldOfStudy: '',
        profilePicture: photoURL || `https://api.dicebear.com/7.x/micah/svg?seed=${email}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, userData, { merge: true });
    }
  }

  const handleSuccess = () => {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur STUD'IN!",
      });
      const from = searchParams.get('from') || '/social';
      router.push(from);
  }

  const handleError = (error: any) => {
      let description = "Une erreur est survenue.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Adresse e-mail ou mot de passe incorrect."
      }
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await signInWithEmailAndPassword(auth, email, password);
      handleSuccess();
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading('');
    }
  };
  
  const servicesReady = !!auth && !!firestore && !isUserLoading;

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
         <Link href="/" className="flex items-center gap-3 justify-center">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold">STUD'IN</h1>
          </Link>
        <CardTitle className="text-2xl pt-4">Connexion</CardTitle>
        <CardDescription>Accédez à votre compte STUD'IN</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
           <div className='grid grid-cols-1 gap-4'>
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={!!loading || !servicesReady}>
                    <GoogleIcon className="mr-2 h-4 w-4" />
                    Google
                </Button>
           </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!servicesReady}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            <Button type="submit" className="w-full" disabled={!!loading || !servicesReady}>
              {loading === 'email' ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
         <p className="text-sm text-muted-foreground">
            Pas encore de compte ?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Inscrivez-vous
            </Link>
          </p>
      </CardFooter>
    </Card>
  );
}
