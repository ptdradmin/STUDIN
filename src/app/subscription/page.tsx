
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, CreditCard, Gem, PartyPopper, Sparkles, Target } from "lucide-react";
import SocialSidebar from "@/components/social-sidebar";
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking } from "@/firebase";
import { doc } from 'firebase/firestore';
import type { UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogoIcon } from "@/components/logo-icon";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';


const VisaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" fill="none" {...props}>
        <rect width="38" height="24" rx="4" fill="#0057A0"/>
        <path d="M23.01 6.5H26.33L23.48 17.5H20.23L23.01 6.5ZM12.23 6.5C11.59 6.5 11.04 6.8 10.75 7.2L7.17 17.5H10.51L11.13 15.9H15.23L15.64 17.5H18.66L15.4 6.5H12.23ZM11.98 13.6L13.21 9.5L14.49 13.6H11.98ZM34.22 11C34.22 9.9 33.13 9.4 32.08 9.4C31.25 9.4 30.58 9.8 30.23 10.2L30.94 6.7H28L25.7 17.5H28.92L29.16 16.4C29.63 17.2 30.59 17.6 31.64 17.6C33.28 17.6 34.22 16.7 34.22 15.4V11ZM31.15 15.2C30.41 15.2 29.84 14.8 29.62 14.1L31.11 10C31.26 9.9 31.55 9.9 31.82 9.9C32.33 9.9 32.56 10.2 32.56 10.7V15.2H31.15Z" fill="white"/>
    </svg>
);

const MastercardIcon = (props: React.SVGProps<SVGSVGElement>) => (
   <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" fill="none" {...props}>
        <rect width="38" height="24" rx="4" fill="#222"/>
        <circle cx="15" cy="12" r="7" fill="#EB001B"/>
        <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
        <path d="M20 12C20 15.866 16.866 19 13 19C9.13401 19 6 15.866 6 12C6 8.13401 9.13401 5 13 5C14.7432 5 16.3312 5.66465 17.5113 6.7461C16.3267 7.83495 15.5 9.3948 15.5 11.1C15.5 11.4132 15.5401 11.7202 15.6163 12.0163C15.0673 11.9402 14.5034 11.9 13.9286 11.9C13.623 11.9 13.3221 11.9213 13.0286 11.962C12.5113 10.785 12.8687 9.35626 13.882 8.34302C13.2598 8.11867 12.6052 8 11.9286 8C10.0337 8 8.41473 9.13401 7.74286 10.7143H20.25Z" fill="#FF5F00" fillOpacity=".8"/>
    </svg>
);


export default function SubscriptionPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    
    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
    const [isProcessing, setIsProcessing] = useState(false);

    const isPro = userProfile?.isPro || false; 

    const handleSubscription = async (subscribe: boolean) => {
        if (!userProfileRef) return;
        
        setIsProcessing(true);
        try {
            updateDocumentNonBlocking(userProfileRef, { isPro: subscribe });
            toast({
                title: subscribe ? "Félicitations !" : "Abonnement annulé",
                description: subscribe ? "Vous êtes maintenant un membre STUD'IN Pro." : "Votre abonnement Pro a été annulé.",
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Erreur",
                description: "Une erreur est survenue lors de la mise à jour de votre abonnement.",
            });
        } finally {
            setIsProcessing(false);
        }
    }


    return (
        <div className="flex min-h-screen w-full bg-background">
            {user && <SocialSidebar />}
            <div className="flex flex-col flex-1">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                     <Link href={user ? "/social" : "/"} className="flex items-center gap-2 text-xl font-bold">
                       <LogoIcon />
                       <span className="font-headline hidden sm:inline">STUD'IN</span>
                    </Link>
                </header>
                <main className="flex-1 overflow-y-auto">
                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10">
                        <div className="container mx-auto px-4 py-12 text-center">
                            <h1 className="text-4xl font-bold">Abonnement STUD'IN</h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                Choisissez votre plan et débloquez le plein potentiel de l'IA.
                            </p>
                        </div>
                    </div>
                    <div className="container mx-auto max-w-4xl px-4 py-8">
                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             {/* Free Card */}
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-2xl">
                                        <Sparkles className="text-muted-foreground"/>
                                        STUD'IN Flash
                                    </CardTitle>
                                    {isPro ? (
                                        <CardDescription>Le forfait de base inclus.</CardDescription>
                                    ) : (
                                        <CardDescription className="text-primary font-semibold flex items-center gap-2">
                                            <Check className="h-4 w-4"/> Forfait actuel
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                   <p className="text-3xl font-bold">Gratuit</p>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Modèle rapide pour des réponses instantanées.</li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Conversation multimodale (Texte, Voix).</li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Analyse d'images simple.</li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button variant="secondary" className="w-full" asChild>
                                        <Link href="/ai-chat">Accéder au Chat</Link>
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Pro Card */}
                            <Card className="border-primary border-2 flex flex-col relative overflow-hidden shadow-lg">
                                <div className="absolute top-0 right-0 py-1 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-bl-lg">LE PLUS PUISSANT</div>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-2xl">
                                        <Gem className="text-primary"/>
                                        STUD'IN Pro
                                    </CardTitle>
                                    {isPro && (
                                        <CardDescription className="text-green-500 font-semibold flex items-center gap-2">
                                            <Check className="h-4 w-4"/> FORFAIT ACTIF
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                   <p className="text-3xl font-bold">4,99 €<span className="text-lg text-muted-foreground">/mois</span></p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/><strong>Toutes les fonctionnalités gratuites, plus :</strong></li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Modèle de langage le plus avancé</li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Génération de légendes IA pour vos posts</li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Génération d'images haute qualité</li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Analyse et aide à la rédaction</li>
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {isPro ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" className="w-full" disabled={isProcessing}>Gérer l'abonnement</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Gérer votre abonnement</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Vous pouvez annuler votre abonnement Pro à tout moment. Vous conserverez l'accès aux fonctionnalités jusqu'à la fin de votre période de facturation actuelle.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Retour</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleSubscription(false)} className="bg-destructive hover:bg-destructive/90">
                                                        Annuler l'abonnement Pro
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button className="w-full" size="lg" disabled={isProcessing}>Passer à Pro</Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Passer à STUD'IN Pro</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Un système de paiement sécurisé sera bientôt intégré. Pour l'instant, ceci est une simulation.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="space-y-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="card-name">Nom sur la carte</Label>
                                                        <Input id="card-name" placeholder="John Doe" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="card-number">Numéro de carte</Label>
                                                            <div className="flex items-center gap-2">
                                                                <VisaIcon />
                                                                <MastercardIcon />
                                                            </div>
                                                        </div>
                                                        <Input id="card-number" placeholder="**** **** **** 1234" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label htmlFor="expiry-date">Date d'expiration</Label>
                                                            <Input id="expiry-date" placeholder="MM/AA" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label htmlFor="cvc">CVC</Label>
                                                            <Input id="cvc" placeholder="123" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleSubscription(true)}>Payer et s'abonner</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
