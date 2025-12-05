
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
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" role="img" aria-labelledby="pi-visa" {...props}>
        <title id="pi-visa">Visa</title>
        <g fill="#1A1F71">
            <path d="M35,0H3C1.3,0,0,1.3,0,3v18c0,1.7,1.4,3,3,3h32c1.7,0,3-1.3,3-3V3C38,1.3,36.7,0,35,0z"/>
            <path d="M12.4,16.3h2.3l1.1-5.7H9.9l-1.3,5.7h2.3c0.3,0,0.5-0.1,0.6-0.4l0.2-1h2.3l0.2,1C11.9,16.2,12.1,16.3,12.4,16.3z M9.8,14.2l0.4-1.9l0.4,1.9H9.8z M23,10.6h-2.1c-0.5,0-0.8,0.2-1,0.5l-2.1,5.2h2.3c0.3,0,0.5-0.1,0.6-0.4l0.2-1h2.1l0.2,1c0.1,0.3,0.3,0.4,0.6,0.4h2.3l-2-5.2C23.6,10.8,23.3,10.6,23,10.6z M21.9,13.4h-1.4l0.7-1.9L21.9,13.4z M33.6,11.8h-1.7c-0.4,0-0.6,0.1-0.7,0.4l-1.3,4.1h2.3c0.3,0,0.5-0.1,0.6-0.4l0.2-1h2.1l0.2,1c0.1,0.3,0.3,0.4,0.6,0.4h2.3l-2-5.2C34.1,11.9,33.9,11.8,33.6,11.8z M32.5,14.3h-1.4l0.7-1.9L32.5,14.3z" fill="#F7B600"/>
        </g>
    </svg>
);

const MastercardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="38" height="24" viewBox="0 0 38 24" role="img" aria-labelledby="pi-mastercard" {...props}>
        <title id="pi-mastercard">Mastercard</title>
        <path d="M35,0H3C1.3,0,0,1.3,0,3v18c0,1.7,1.4,3,3,3h32c1.7,0,3-1.3,3-3V3C38,1.3,36.7,0,35,0z" fill="#222"/>
        <circle cx="15" cy="12" r="7" fill="#EB001B"/>
        <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
        <path d="M22,12c0,0.9-0.2,1.8-0.5,2.6c-0.4,0.8-1,1.4-1.6,2s-1.3,0.9-2.2,1.1c0,0.1-0.1,0.2-0.1,0.3v0.1h-2.7v-0.1c0-0.1,0.1-0.2,0.1-0.3c0.8-0.3,1.5-0.7,2.2-1.1c0.7-0.4,1.2-1,1.6-2c0.4-0.7,0.6-1.6,0.6-2.5c0-1.6-1.3-2.9-3.1-2.9c-1.2,0-2.3,0.6-2.8,1.6C16.1,11.5,16,12,16,12.5v0.1h2.7v-0.1c0-0.4,0.1-0.7,0.4-1.1c0.4-0.4,0.9-0.7,1.5-0.7s1.1,0.3,1.5,0.7C21.8,11.3,22,11.9,22,12.5z" fill="#FF5F00"/>
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

