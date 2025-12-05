
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
                     <Link href="/social" className="flex items-center gap-2 text-xl font-bold">
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
                                                    <Label htmlFor="card-number">Numéro de carte</Label>
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

