'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';

const forgotPasswordSchema = z.object({
  email: z.string().email("L'adresse e-mail n'est pas valide"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { auth, isUserLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    if (!auth) {
        toast({ variant: 'destructive', title: 'Erreur', description: 'Service d\'authentification indisponible.' });
        return;
    }
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, data.email);
      setEmailSent(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'e-mail. Vérifiez que l'adresse est correcte.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const buttonsDisabled = loading || isUserLoading;

  return (
    <div className="w-full min-h-screen flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                 <Link href="/" className="flex items-center gap-2 justify-center text-2xl font-bold mb-4">
                    <LogoIcon />
                    <span className="font-headline">STUD'IN</span>
                </Link>
                <CardTitle className="text-2xl">Mot de passe oublié ?</CardTitle>
                <CardDescription>
                    {emailSent 
                        ? "Vérifiez votre boîte de réception (et vos spams)." 
                        : "Entrez votre e-mail pour recevoir un lien de réinitialisation."
                    }
                </CardDescription>
            </CardHeader>
            {emailSent ? (
                <CardContent className="text-center">
                    <p className="text-muted-foreground">
                        Si un compte est associé à cette adresse e-mail, vous recevrez un lien pour réinitialiser votre mot de passe d'ici quelques minutes.
                    </p>
                </CardContent>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
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
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={buttonsDisabled}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {loading ? 'Envoi...' : 'Envoyer le lien'}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            )}
             <CardFooter className="justify-center">
                 <Button variant="link" asChild>
                    <Link href="/login">Retour à la connexion</Link>
                </Button>
             </CardFooter>
        </Card>
    </div>
  );
}
