
"use client";

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { Eye, EyeOff, GraduationCap, Loader2 } from 'lucide-react';
import { generateAvatar } from '@/lib/avatars';
import { verifyRecaptcha } from '@/ai/flows/verify-recaptcha-flow';

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
  const [loading, setLoading] = useState(''); // can be 'google', 'email'
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth, firestore, isUserLoading } = useAuth();
  const { toast } = useToast();

  const getRecaptchaToken = useCallback(async (action: string) => {
    if (!(window as any).grecaptcha) {
      console.error("reCAPTCHA script not loaded");
      toast({ variant: "destructive", title: "Erreur", description: "Le service de sécurité n'est pas disponible. Veuillez rafraîchir la page." });
      return null;
    }
    return new Promise<string>((resolve) => {
      (window as any).grecaptcha.enterprise.ready(async () => {
        const token = await (window as any).grecaptcha.enterprise.execute('6Ld46CAsAAAAAHk2HTOXIETvWVB0r_Qz_l7pS2gX', { action });
        resolve(token);
      });
    });
  }, [toast]);

  const isUsernameUnique = async (username: string): Promise<boolean> => {
    if (!firestore) return false;
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };


  const createUserDocument = async (user: User) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      const { email, displayName, photoURL } = user;
      const [firstName, lastName] = displayName?.split(' ') || ['', ''];
      
      let username = email?.split('@')[0] || `user${user.uid.substring(0,6)}`;
      username = username.toLowerCase().replace(/[^a-z0-9_.]/g, '');
      
      let isUnique = await isUsernameUnique(username);
      let counter = 1;
      while(!isUnique) {
          const newUsername = `${username}${counter}`;
          isUnique = await isUsernameUnique(newUsername);
          if (isUnique) {
              username = newUsername;
          }
          counter++;
      }

      const userData = {
        id: user.uid,
        email,
        username,
        role: 'student',
        firstName: firstName || '',
        lastName: lastName || '',
        university: '',
        fieldOfStudy: '',
        postalCode: '',
        city: '',
        bio: '',
        website: '',
        profilePicture: photoURL || generateAvatar(user.email || user.uid),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        followerIds: [],
        followingIds: [],
        points: 0,
        challengesCompleted: 0,
        isVerified: false,
      };
      await setDoc(userDocRef, userData, { merge: true });
    }
  }

  const handleSuccess = (user: User) => {
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.displayName || user.email} !`,
      });
      
      const from = searchParams.get('from') || '/social';
      
      router.push(from);
      router.refresh();
  }

  const handleError = (error: any) => {
      let description = "Une erreur est survenue.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "Adresse e-mail ou mot de passe incorrect."
      }
       if (error.code === 'auth/popup-closed-by-user') {
        description = "La fenêtre de connexion a été fermée."
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
      handleSuccess(result.user);
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        toast({variant: "destructive", title: "Champs requis", description: "Veuillez remplir tous les champs."});
        return;
    }
    setLoading('email');
    
    const token = await getRecaptchaToken('LOGIN');
    if (!token) {
        setLoading('');
        return;
    }

    const recaptchaResult = await verifyRecaptcha({ token, expectedAction: 'LOGIN' });
    if (!recaptchaResult.isVerified) {
        toast({ variant: "destructive", title: "Vérification échouée", description: "Activité suspecte détectée. Veuillez réessayer." });
        setLoading('');
        return;
    }
    
    if (!auth || !firestore) {
      toast({ variant: "destructive", title: "Erreur", description: "Le service d'authentification n'est pas disponible." });
      setLoading('');
      return;
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      handleSuccess(userCredential.user);
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading('');
    }
  };
  
  const servicesReady = !!auth && !!firestore && !isUserLoading;

  return (
    <div className="mx-auto grid w-full max-w-[350px] gap-6">
        <div className="grid gap-2 text-center">
             <Link href="/" className="flex items-center gap-3 justify-center mb-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                    <GraduationCap className="h-7 w-7 text-white" />
                </div>
            </Link>
          <h1 className="text-3xl font-bold">Connexion</h1>
          <p className="text-balance text-muted-foreground">
            Accédez à votre compte pour continuer
          </p>
        </div>
        <div className="grid gap-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Mot de passe oublié?
                </Link>
              </div>
               <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!!loading}
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
            <Button type="submit" className="w-full" disabled={!!loading}>
                {loading === 'email' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading === 'email' ? 'Connexion...' : 'Se connecter'}
            </Button>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    OU
                </span>
                </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={!!loading}>
                {loading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                Se connecter avec Google
            </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Pas encore de compte?{" "}
          <Link href="/register" className="underline">
            Inscrivez-vous
          </Link>
        </div>
      </div>
  );
}
