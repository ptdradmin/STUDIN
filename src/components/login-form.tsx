
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { User, signInWithEmailAndPassword } from 'firebase/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { LogoIcon } from './logo-icon';


export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth, isUserLoading } = useAuth();
  const { toast } = useToast();

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
    setLoading(false);
    let description = "Une erreur de connexion est survenue. Veuillez réessayer.";
    
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            description = "Adresse e-mail ou mot de passe incorrect.";
            break;
        case 'auth/too-many-requests':
            description = "L'accès à ce compte a été temporairement désactivé en raison de nombreuses tentatives de connexion infructueuses. Vous pouvez le restaurer immédiatement en réinitialisant votre mot de passe ou vous pouvez réessayer plus tard.";
            break;
        case 'auth/network-request-failed':
            description = "Erreur de réseau. Veuillez vérifier votre connexion internet.";
            break;
        default:
             description = `Une erreur inattendue est survenue. (${error.code})`;
    }

    toast({
      variant: "destructive",
      title: "Erreur de connexion",
      description: description,
    });
  }


  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: "destructive", title: "Champs requis", description: "Veuillez remplir tous les champs." });
      return;
    }
    if (!auth) {
        toast({variant: "destructive", title: "Erreur", description: "Le service d'authentification n'est pas disponible."});
        return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      handleSuccess(userCredential.user);
    } catch (error: any) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  }

  const buttonsDisabled = loading || isUserLoading;

  return (
    <div className="mx-auto grid w-full max-w-[350px] gap-6">
        <div className="grid gap-2 text-center">
             <Link href="/" className="flex items-center gap-2 justify-center text-2xl font-bold mb-4">
                <LogoIcon />
                <span className="font-headline">STUD'IN</span>
            </Link>
          <h1 className="text-3xl font-bold">Connexion</h1>
          <p className="text-balance text-muted-foreground">
            Accédez à votre compte pour continuer
          </p>
        </div>
        <div className="grid gap-4">
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre.email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={buttonsDisabled}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="/forgot-password"
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
                  disabled={buttonsDisabled}
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
            <Button type="submit" className="w-full" disabled={buttonsDisabled}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
            </form>
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
