"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock authentication
    setTimeout(() => {
      if (email && password) {
        login({ email, password, first_name: 'Jean', last_name: 'Dupont' });
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur STUD'IN!",
        });
        const from = searchParams.get('from') || '/';
        router.push(from);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur de connexion",
          description: "Veuillez vérifier vos identifiants.",
        });
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Connexion</CardTitle>
        <CardDescription>Accédez à votre compte STUD'IN</CardDescription>
      </CardHeader>
      <CardContent>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
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
