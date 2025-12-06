'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, Gem, Sparkles, Loader2 } from "lucide-react";
import SocialSidebar from "@/components/social-sidebar";
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking } from "@/firebase";
import { doc } from 'firebase/firestore';
import type { UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState, useEffect, Suspense } from "react";
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
import { useRouter, useSearchParams } from 'next/navigation';
import { createCheckoutSession } from "@/ai/flows/create-checkout-session-flow";

const SubscriptionContent = () => {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
    const [isProcessing, setIsProcessing] = useState(false);

    const isPro = userProfile?.isPro || false;

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId && userProfileRef) {
            // This means the user is coming back from a successful Stripe checkout.
            // We can now update their status to Pro.
            updateDocumentNonBlocking(userProfileRef, { isPro: true });
            toast({
                title: "Paiement réussi !",
                description: "Félicitations, vous êtes maintenant membre Alice Pro.",
                duration: 5000,
            });
            // Clean the URL to prevent re-triggering this effect
            router.replace('/subscription', { scroll: false });
        }
    }, [searchParams, userProfileRef, router, toast]);

    const handleSubscription = async (subscribe: boolean) => {
        if (!userProfileRef) return;

        setIsProcessing(true);
        try {
            updateDocumentNonBlocking(userProfileRef, { isPro: subscribe });
            toast({
                title: subscribe ? "Félicitations !" : "Abonnement annulé",
                description: subscribe ? "Vous êtes maintenant un membre Alice Pro." : "Votre abonnement Pro a été annulé.",
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

    const handleRedirectToCheckout = async () => {
        if (!user || !user.email) {
            toast({ variant: 'destructive', title: "Erreur", description: "Vous devez être connecté pour vous abonner." });
            router.push('/login?from=/subscription');
            return;
        }
        setIsProcessing(true);
        try {
            const { url } = await createCheckoutSession({ userId: user.uid, email: user.email });
            if (url) {
                router.push(url);
            } else {
                throw new Error("URL de paiement non reçue.");
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Erreur de paiement', description: 'Impossible de lancer le processus de paiement. Veuillez réessayer.' });
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
                            <h1 className="text-4xl font-bold">Abonnement Alice</h1>
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
                                        <Sparkles className="text-muted-foreground" />
                                        Alice
                                    </CardTitle>
                                    <CardDescription>Le forfait de base pour tous les étudiants.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <p className="text-3xl font-bold">Gratuit</p>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Modèle rapide pour des réponses instantanées.</li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Conversation multimodale (Texte, Voix).</li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Analyse d'images simple.</li>
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
                                        <Gem className="text-primary" />
                                        Alice Pro
                                    </CardTitle>
                                    {isPro && (
                                        <CardDescription className="text-green-500 font-semibold flex items-center gap-2">
                                            <Check className="h-4 w-4" /> FORFAIT ACTIF
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-grow space-y-4">
                                    <p className="text-3xl font-bold">4,99 €<span className="text-lg text-muted-foreground">/mois</span></p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /><strong>Toutes les fonctionnalités gratuites, plus :</strong></li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Modèle de langage le plus avancé</li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Génération de légendes IA pour vos posts</li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Génération d'images haute qualité</li>
                                        <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />Analyse et aide à la rédaction</li>
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
                                        <Button className="w-full" size="lg" onClick={handleRedirectToCheckout} disabled={isProcessing}>
                                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Gem className="mr-2 h-4 w-4" />}
                                            Passer à Pro
                                        </Button>
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

export default function SubscriptionPage() {
    return (
        <Suspense fallback={<div>Chargement...</div>}>
            <SubscriptionContent />
        </Suspense>
    );
}
