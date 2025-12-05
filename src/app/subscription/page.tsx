
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle2, ClipboardCheck, Gem, PartyPopper, Sparkles, Target } from "lucide-react";
import SocialSidebar from "@/components/social-sidebar";
import GlobalSearch from "@/components/global-search";
import NotificationsDropdown from "@/components/notifications-dropdown";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function SubscriptionPage() {
    // In a real app, you would check the user's subscription status
    const isPro = false; 

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex flex-col flex-1">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex-1 max-w-md">
                        <GlobalSearch />
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationsDropdown />
                    </div>
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
                                    <CardDescription className="text-green-500 font-semibold">FORFAIT ACTUEL : PRO</CardDescription>
                                ) : (
                                    <CardDescription>FORFAIT ACTUEL : GRATUIT</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                               <p className="text-sm text-muted-foreground mb-4">Passez à la vitesse supérieure avec les fonctionnalités exclusives de notre intelligence artificielle de pointe.</p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm mb-6">
                                    <li className="flex items-center gap-3"><Sparkles className="h-4 w-4 text-primary"/>Légendes IA pour vos posts</li>
                                    <li className="flex items-center gap-3"><ClipboardCheck className="h-4 w-4 text-primary"/>Analyse IA de vos annonces</li>
                                    <li className="flex items-center gap-3"><Target className="h-4 w-4 text-primary"/>Recommandations de défis</li>
                                    <li className="flex items-center gap-3"><PartyPopper className="h-4 w-4 text-primary"/>Assistance création d'événements</li>
                                    <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-primary"/>Badge de profil Pro</li>
                                    <li className="flex items-center gap-3"><Gem className="h-4 w-4 text-primary"/>Modèle STUD'IN Pro</li>
                                </ul>
                                <div className="text-center p-6 bg-background/50 rounded-lg border">
                                    <p className="text-4xl font-bold">4,99 €<span className="text-xl font-medium text-muted-foreground">/mois</span></p>
                                    <p className="text-xs text-muted-foreground mt-2">Économisez 16 % avec la facturation annuelle (49,99 €/an).</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {isPro ? (
                                    <Button variant="outline" className="w-full" disabled>Vous êtes déjà Pro</Button>
                                ) : (
                                    <Button className="w-full" size="lg">Passer à Pro</Button>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}
