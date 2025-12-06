
'use client';

import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Bed, Car, PartyPopper, BookOpen, Target, ArrowRight, Sparkles, Check, UserPlus, Search, MessageSquare, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';

const services = [
    {
        name: "Logements",
        description: "Que vous cherchiez un kot pour l'année, un studio pour votre indépendance ou une colocation pour partager les frais, notre plateforme centralise les meilleures offres près des campus. Fini les recherches interminables.",
        icon: <Bed className="h-8 w-8" />,
        href: "/housing",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop"
    },
    {
        name: "Covoiturage",
        description: "Partagez vos trajets quotidiens ou occasionnels pour aller en cours ou rentrer le week-end. Économisez sur vos frais de transport, réduisez votre empreinte carbone et faites de nouvelles rencontres en chemin.",
        icon: <Car className="h-8 w-8" />,
        href: "/carpooling",
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop"
    },
    {
        name: "Tutorat & Marché aux Livres",
        description: "Obtenez un coup de pouce dans les matières qui vous posent problème grâce à d'autres étudiants, ou partagez vos connaissances. Achetez et vendez également vos livres de cours d'occasion en toute simplicité.",
        icon: <BookOpen className="h-8 w-8" />,
        href: "/tutoring",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
    },
    {
        name: "Événements",
        description: "Découvrez les meilleures soirées, conférences et activités étudiantes de votre ville. Ne manquez rien de la vie de campus.",
        icon: <PartyPopper className="h-8 w-8" />,
        href: "/events",
        image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=2070&auto=format&fit=crop"
    },
];

const howItWorksSteps = [
  {
    icon: <UserPlus className="h-8 w-8" />,
    title: "1. Créez votre profil",
    description: "Inscrivez-vous gratuitement en quelques clics et personnalisez votre profil pour rejoindre la communauté."
  },
  {
    icon: <Search className="h-8 w-8" />,
    title: "2. Explorez les services",
    description: "Parcourez les annonces de logement, les offres de covoiturage, les tuteurs disponibles et bien plus encore."
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: "3. Connectez-vous",
    description: "Contactez directement d'autres étudiants via la messagerie sécurisée pour vous organiser."
  }
];

export default function HomePage() {

    return (
        <div className="flex flex-col min-h-screen dark:bg-background">
            <Navbar />
            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative h-[70vh] min-h-[550px] flex items-center justify-center text-center text-white overflow-hidden">
                    <div className="absolute inset-0">
                        <Image
                            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                            alt="Étudiants heureux travaillant ensemble"
                            fill
                            className="object-cover"
                            priority
                            data-ai-hint="étudiants heureux"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                    </div>
                    <div className="container mx-auto px-4 relative z-10">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter drop-shadow-2xl">
                            L'écosystème qui simplifie votre vie étudiante.
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-white/90 drop-shadow-lg">
                            Trouvez un logement, partagez un trajet, réussissez vos cours et ne manquez aucun événement. Tout au même endroit.
                        </p>
                        <div className="mt-8 flex justify-center items-center gap-4">
                            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                                <Link href="/register">Rejoindre la communauté</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="text-white border-white/50 hover:bg-white/10 hover:text-white backdrop-blur-sm">
                                <Link href="#features">Découvrir les services <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-16 md:py-24 bg-background">
                  <div className="container mx-auto px-4">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Comment ça marche ?
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                           Commencez à simplifier votre vie étudiante en 3 étapes faciles.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {howItWorksSteps.map((step) => (
                        <div key={step.title} className="flex flex-col items-center text-center p-6 border border-border/50 rounded-lg">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                            {step.icon}
                          </div>
                          <h3 className="text-xl font-semibold">{step.title}</h3>
                          <p className="text-muted-foreground mt-2">{step.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-16 md:py-24 bg-muted/40">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto mb-16 max-w-3xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                                Une Plateforme, Toutes les Solutions
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                Tout ce dont vous avez besoin pour une vie étudiante épanouie, centralisé et simplifié.
                            </p>
                        </div>
                        <div className="space-y-20">
                            {services.map((service, index) => (
                                <div key={service.name} className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                                    <div className={`relative aspect-video rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 ${index % 2 === 0 ? '' : 'md:order-last'}`}>
                                        <Image
                                            src={service.image}
                                            alt={service.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                                            {service.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold">{service.name}</h3>
                                        <p className="mt-3 text-muted-foreground">{service.description}</p>
                                        <Button asChild variant="link" className="mt-4 px-0">
                                            <Link href={service.href || '#'}>Explorer {service.name} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                {/* Challenges Section */}
                <section className="relative py-20 md:py-32">
                    <div className="absolute inset-0">
                        <Image
                            src="https://images.unsplash.com/photo-1574235124952-f2882195642a?q=80&w=2070&auto=format&fit=crop"
                            alt="Vue urbaine pour les défis"
                            fill
                            className="object-cover"
                            data-ai-hint="city exploration"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>
                    <div className="container mx-auto px-4 relative z-10 text-center text-white">
                         <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/80 text-white mb-6">
                            <Target className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Transformez votre ville en terrain de jeu</h2>
                        <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">Relevez des défis, gagnez des points, et explorez votre environnement comme jamais auparavant.</p>
                        <Button asChild size="lg" className="mt-8">
                            <Link href="/challenges">Découvrir les défis</Link>
                        </Button>
                    </div>
                </section>

                {/* AI Presentation Section */}
                <section id="ai-presentation" className="py-16 md:py-24 bg-background">
                  <div className="container mx-auto px-4">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                       <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Alice, Votre Assistante Personnelle
                      </h2>
                      <p className="mt-4 text-lg text-muted-foreground">
                        Une intelligence artificielle conçue pour vous, intégrée à votre quotidien étudiant.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Alice Free */}
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <Sparkles className="text-muted-foreground"/>
                                    Alice
                                </CardTitle>
                                <CardDescription>L'assistante rapide et efficace pour tous.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <p className="text-3xl font-bold">Gratuit</p>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Modèle rapide pour des réponses instantanées.</li>
                                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Conversation multimodale (Texte, Voix, Image).</li>
                                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Analyse de documents et d'images.</li>
                                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Connaissance de la vie étudiante en Belgique.</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button variant="secondary" className="w-full" asChild>
                                    <Link href="/subscription">Essayer maintenant</Link>
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Alice Pro */}
                         <Card className="border-primary border-2 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 py-1 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-bl-lg">LE PLUS PUISSANT</div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <BadgeCheck className="text-primary"/>
                                    Alice Pro
                                </CardTitle>
                                <CardDescription>Débloquez le potentiel maximal de l'IA.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                               <p className="text-3xl font-bold">4,99 €<span className="text-lg text-muted-foreground">/mois</span></p>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/><strong>Toutes les fonctionnalités gratuites, plus :</strong></li>
                                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Modèle de langage avancé pour un raisonnement supérieur.</li>
                                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Génération de légendes IA pour vos publications.</li>
                                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Génération d'images haute qualité.</li>
                                    <li className="flex items-start gap-2"><Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"/>Analyse et aide à la rédaction pour vos annonces.</li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" asChild>
                                    <Link href="/subscription">Passer à Pro</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                  </div>
                </section>
                
            </main>
            <Footer />
        </div>
    );
}
