
'use client';

import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Bed, Car, PartyPopper, BookOpen, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const services = [
    {
        name: "Logements",
        description: "Trouvez le kot ou studio parfait près de votre campus.",
        icon: <Bed className="h-6 w-6"/>,
        href: "/housing",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop"
    },
    {
        name: "Covoiturage",
        description: "Partagez vos trajets pour économiser et faire des rencontres.",
        icon: <Car className="h-6 w-6"/>,
        href: "/carpooling",
        image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?q=80&w=2070&auto=format&fit=crop"
    },
     {
        name: "Tutorat",
        description: "Obtenez de l'aide pour réussir ou proposez vos compétences.",
        icon: <BookOpen className="h-6 w-6"/>,
        href: "/tutoring",
        image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop"
    },
    {
        name: "Marché aux Livres",
        description: "Achetez ou vendez vos livres de cours d'occasion.",
        icon: <BookOpen className="h-6 w-6"/>,
        href: "/books",
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1974&auto=format&fit=crop"
    },
     {
        name: "Événements",
        description: "Découvrez les meilleures soirées et activités étudiantes.",
        icon: <PartyPopper className="h-6 w-6"/>,
        href: "/events",
        image: "https://images.unsplash.com/photo-1519750024422-3806dfa9c723?q=80&w=1974&auto=format&fit=crop"
    },
    {
        name: "Défis",
        description: "Relevez des défis, gagnez des points et explorez votre ville.",
        icon: <Target className="h-6 w-6" />,
        href: "/challenges",
        image: "https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?q=80&w=2116&auto=format&fit=crop"
    },
]

export default function HomePage() {

    return (
        <div className="flex flex-col min-h-screen dark:bg-background">
          <Navbar />
          <main className="flex-grow">
                <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center text-center text-white overflow-hidden">
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
                            Trouvez un logement, partagez un trajet, réussissez vos cours, relevez des défis et ne manquez aucun événement.
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
                
                <section id="features" className="py-16 md:py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto mb-12 max-w-3xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Une Plateforme, Toutes les Solutions
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                            Tout ce dont vous avez besoin pour une vie étudiante épanouie, centralisé et simplifié.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {services.map(service => (
                                <Link href={service.href} key={service.name} className="block group">
                                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg h-full transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                                        <Image
                                          src={service.image}
                                          alt={service.name}
                                          fill
                                          className="object-cover"
                                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-4 text-white">
                                            <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm w-fit mb-2">
                                                {service.icon}
                                            </div>
                                            <h3 className="text-xl font-bold">{service.name}</h3>
                                            <p className="text-xs text-white/80 mt-1">{service.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
          </main>
          <Footer />
        </div>
      );
}
