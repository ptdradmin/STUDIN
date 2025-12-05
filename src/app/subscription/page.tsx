

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
    <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="38" height="24" rx="3" fill="#0057A0"/>
        <path d="M22.997 6.452H26.33L23.473 17.548H20.218L22.997 6.452ZM12.215 6.452C11.583 6.452 11.033 6.744 10.74 7.23L7.158 17.548H10.5L11.124 15.86H15.22L15.629 17.548H18.65L15.39 6.452H12.215ZM11.97 13.568L13.202 9.53L14.48 13.568H11.97ZM34.218 10.976C34.218 9.944 33.129 9.38 32.072 9.38C31.246 9.38 30.569 9.776 30.222 10.232L30.938 6.74H28L25.688 17.548H28.91L29.155 16.364C29.625 17.156 30.585 17.6 31.63 17.6C33.27 17.6 34.218 16.664 34.218 15.356V10.976ZM31.144 15.152C30.402 15.152 29.836 14.772 29.61 14.12L31.103 10.024C31.258 9.944 31.542 9.888 31.81 9.888C32.322 9.888 32.553 10.216 32.553 10.664V15.152H31.144Z" fill="white"/>
    </svg>
);

const MastercardIcon = (props: React.SVGProps<SVGSVGElement>) => (
   <svg width="38" height="24" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="38" height="24" rx="3" fill="#222222"/>
        <circle cx="15" cy="12" r="7" fill="#EB001B"/>
        <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
        <path d="M20.25,12c0,3.866-3.134,7-7,7s-7-3.134-7-7s3.134-7,7-7c0.85,0,1.67,0.15,2.43,0.43c-1.8,1.43-3,3.58-3,6.57z" fill="#FF5F00"/>
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
                                        <CardDescription>Passez au Pro pour plus de fonctionnalités.</CardDescription>
                                    ) : (
                                        <CardDescription className="text-green-500 font-semibold flex items-center gap-2">
                                            <Check className="h-4 w-4"/> FORFAIT ACTIF
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
                                        <Link href="/ai-chat">Utiliser l'IA</Link>
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
