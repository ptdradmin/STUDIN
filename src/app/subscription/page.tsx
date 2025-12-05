
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


const VisaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" {...props} role="img" aria-labelledby="pi-visa">
        <title id="pi-visa">Visa</title>
        <path fill="#1A1F71" d="M35,0H3C1.3,0,0,1.3,0,3v18c0,1.7,1.4,3,3,3h32c1.7,0,3-1.3,3-3V3C38,1.3,36.7,0,35,0z"/>
        <path fill="#F7B600" d="M12.9,6.8c-0.3-0.3-0.7-0.5-1.2-0.5H8.1c-0.6,0-1.1,0.2-1.4,0.6c-0.4,0.4-0.6,0.9-0.6,1.5l.6,5.8 c0,0.6,0.3,1.1,0.8,1.4c0.5,0.3,1,0.5,1.6,0.5h0.3c0.7,0,1.3-0.2,1.7-0.7c0.4-0.5,0.6-1.1,0.5-1.8l-0.6-5.8 C13.1,7.6,13.1,7.2,12.9,6.8z M10.7,11.4c0.1,0.3,0,0.6-0.2,0.8c-0.2,0.2-0.5,0.3-0.8,0.3h-0.2c-0.3,0-0.6-0.1-0.7-0.3 c-0.2-0.2-0.3-0.5-0.2-0.8l0.4-3.8C9.4,7.4,9.5,7.1,9.8,7c0.2-0.1,0.5,0,0.7,0.2c0.2,0.2,0.3,0.5,0.2,0.8L10.7,11.4z"/>
        <path fill="#F7B600" d="M21.2,6.8c-0.3-0.3-0.7-0.5-1.2-0.5h-3.4c-0.6,0-1.1,0.2-1.4,0.6c-0.4,0.4-0.6,0.9-0.6,1.5l.6,5.8 c0,0.6,0.3,1.1,0.8,1.4c0.5,0.3,1,0.5,1.6,0.5h0.3c0.7,0,1.3-0.2,1.7-0.7c0.4-0.5,0.6-1.1,0.5-1.8l-0.6-5.8 C21.4,7.6,21.4,7.2,21.2,6.8z M19.1,11.4c0.1,0.3,0,0.6-0.2,0.8c-0.2,0.2-0.5,0.3-0.8,0.3h-0.2c-0.3,0-0.6-0.1-0.7-0.3 c-0.2-0.2-0.3-0.5-0.2-0.8l0.4-3.8C17.7,7.4,17.8,7.1,18.1,7c0.2-0.1,0.5,0,0.7,0.2c0.2,0.2,0.3,0.5,0.2,0.8L19.1,11.4z"/>
        <path fill="#F7B600" d="M30.3,10.3c0,0.4,0,0.8-0.1,1.1l-0.2,1c-0.1,0.5-0.3,0.9-0.6,1.2c-0.3,0.3-0.7,0.5-1.2,0.5h-1.6 c-0.3,0-0.6-0.1-0.8-0.2l0.2-1.3c0.1-0.3,0.2-0.6,0.4-0.8c0.2-0.2,0.5-0.3,0.8-0.3h0.6c0.3,0,0.5-0.1,0.7-0.3 c0.2-0.2,0.2-0.5,0.2-0.8c0-0.3-0.1-0.6-0.2-0.8c-0.2-0.2-0.4-0.3-0.7-0.3h-1.1c-0.3,0-0.6,0.1-0.8,0.3L25,6.5 c0.1-0.3,0.3-0.5,0.6-0.7c0.3-0.2,0.6-0.3,1-0.3h1.8c0.6,0,1.1,0.2,1.4,0.6C30.2,6.5,30.3,7,30.3,7.6L30.3,10.3z"/>
    </svg>
);

const MastercardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" {...props} role="img" aria-labelledby="pi-mastercard">
        <title id="pi-mastercard">Mastercard</title>
        <path fill="#FF5F00" d="M12.9,6.8c-0.3-0.3-0.7-0.5-1.2-0.5H8.1c-0.6,0-1.1,0.2-1.4,0.6c-0.4,0.4-0.6,0.9-0.6,1.5l.6,5.8 c0,0.6,0.3,1.1,0.8,1.4c0.5,0.3,1,0.5,1.6,0.5h0.3c0.7,0,1.3-0.2,1.7-0.7c0.4-0.5,0.6-1.1,0.5-1.8l-0.6-5.8 C13.1,7.6,13.1,7.2,12.9,6.8z M10.7,11.4c0.1,0.3,0,0.6-0.2,0.8c-0.2,0.2-0.5,0.3-0.8,0.3h-0.2c-0.3,0-0.6-0.1-0.7-0.3 c-0.2-0.2-0.3-0.5-0.2-0.8l0.4-3.8C9.4,7.4,9.5,7.1,9.8,7c0.2-0.1,0.5,0,0.7,0.2c0.2,0.2,0.3,0.5,0.2,0.8L10.7,11.4z"/>
        <path fill="#EB001B" d="M21.2,6.8c-0.3-0.3-0.7-0.5-1.2-0.5h-3.4c-0.6,0-1.1,0.2-1.4,0.6c-0.4,0.4-0.6,0.9-0.6,1.5l.6,5.8 c0,0.6,0.3,1.1,0.8,1.4c0.5,0.3,1,0.5,1.6,0.5h0.3c0.7,0,1.3-0.2,1.7-0.7c0.4-0.5,0.6-1.1,0.5-1.8l-0.6-5.8 C21.4,7.6,21.4,7.2,21.2,6.8z M19.1,11.4c0.1,0.3,0,0.6-0.2,0.8c-0.2,0.2-0.5,0.3-0.8,0.3h-0.2c-0.3,0-0.6-0.1-0.7-0.3 c-0.2-0.2-0.3-0.5-0.2-0.8l0.4-3.8C17.7,7.4,17.8,7.1,18.1,7c0.2-0.1,0.5,0,0.7,0.2c0.2,0.2,0.3,0.5,0.2,0.8L19.1,11.4z"/>
        <path fill="#F79E1B" d="M35,0H3C1.3,0,0,1.3,0,3v18c0,1.7,1.4,3,3,3h32c1.7,0,3-1.3,3-3V3C38,1.3,36.7,0,35,0z M24.2,12.4c0,0.6-0.2,1.1-0.5,1.5 c-0.3,0.4-0.8,0.6-1.3,0.6h-2.1c-0.5,0-1-0.2-1.3-0.6c-0.3-0.4-0.5-0.9-0.5-1.5v-0.8c0-0.6,0.2-1.1,0.5-1.5 c0.3-0.4,0.8-0.6,1.3-0.6h2.1c0.5,0,1,0.2,1.3,0.6c0.3,0.4,0.5,0.9,0.5,1.5V12.4z"/>
    </svg>
);


export default function SubscriptionPage() {
    const { user } = useUser();
    const firestore = useFirestore();
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
            <SocialSidebar />
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
                            <h1 className="text-4xl font-bold">Abonnement STUD'IN Pro</h1>
                            <p className="mt-2 text-lg text-muted-foreground">
                                Débloquez le plein potentiel de l'IA pour votre vie étudiante.
                            </p>
                        </div>
                    </div>
                    <div className="container mx-auto max-w-2xl px-4 py-8">
                        <Card className="border-primary border-2 flex flex-col relative overflow-hidden shadow-lg">
                             <div className="absolute top-0 right-0 py-1 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-bl-lg">LE PLUS PUISSANT</div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <Gem className="text-primary"/>
                                    STUD'IN AI Pro
                                </CardTitle>
                                {isPro ? (
                                    <CardDescription className="text-green-500 font-semibold flex items-center gap-2">
                                        <Check className="h-4 w-4"/> FORFAIT ACTIF
                                    </CardDescription>
                                ) : (
                                    <CardDescription>FORFAIT ACTUEL : GRATUIT</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                               <p className="text-sm text-muted-foreground mb-4">Passez à la vitesse supérieure avec les fonctionnalités exclusives de notre intelligence artificielle de pointe.</p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
                                    <li className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-primary"/>Légendes IA pour vos posts</li>
                                    <li className="flex items-center gap-3"><CreditCard className="h-4 w-4 text-primary"/>Analyse IA de vos annonces</li>
                                    <li className="flex items-center gap-3"><Target className="h-4 w-4 text-primary"/>Recommandations de défis</li>
                                    <li className="flex items-center gap-3"><PartyPopper className="h-4 w-4 text-primary"/>Assistance création d'événements</li>
                                    <li className="flex items-center gap-3"><Check className="h-4 w-4 text-primary"/>Badge de profil Pro</li>
                                    <li className="flex items-center gap-3"><Gem className="h-4 w-4 text-primary"/>Modèle STUD'IN Pro</li>
                                </ul>
                                <div className="text-center p-6 bg-background/50 rounded-lg border">
                                    <p className="text-4xl font-bold">4,99 €<span className="text-xl font-medium text-muted-foreground">/mois</span></p>
                                    <p className="text-xs text-muted-foreground mt-2">Économisez 16 % avec la facturation annuelle (49,99 €/an).</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {isPro ? (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full" disabled={isProcessing}>Gérer l'abonnement</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Gérer votre abonnement</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès aux fonctionnalités Pro jusqu'à la fin de votre période de facturation actuelle.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Retour</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleSubscription(false)} className="bg-destructive hover:bg-destructive/90">
                                                    Annuler mon abonnement
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
                </main>
            </div>
        </div>
    );
}
