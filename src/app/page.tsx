
'use client';

import { useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Bed, Car, PartyPopper, BookOpen, Target, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const services = [
    {
        name: "Logements",
        description: "Trouvez le kot ou studio parfait près de votre campus, dans un environnement sûr et vérifié.",
        icon: <Bed className="h-6 w-6"/>,
        href: "/housing",
        image: PlaceHolderImages.find(p => p.id === 'service-housing')?.imageUrl || ''
    },
    {
        name: "Covoiturage",
        description: "Partagez vos trajets quotidiens ou occasionnels pour économiser, réduire votre empreinte carbone et faire des rencontres.",
        icon: <Car className="h-6 w-6"/>,
        href: "/carpooling",
        image: PlaceHolderImages.find(p => p.id === 'service-carpooling')?.imageUrl || ''
    },
     {
        name: "Tutorat",
        description: "Obtenez de l'aide pour réussir vos examens ou proposez vos compétences pour aider d'autres étudiants.",
        icon: <BookOpen className="h-6 w-6"/>,
        href: "/tutoring",
        image: PlaceHolderImages.find(p => p.id === 'service-tutoring')?.imageUrl || ''
    },
     {
        name: "Événements",
        description: "Découvrez et participez aux meilleures soirées, conférences et activités étudiantes de votre ville.",
        icon: <PartyPopper className="h-6 w-6"/>,
        href: "/events",
        image: PlaceHolderImages.find(p => p.id === 'service-events')?.imageUrl || ''
    },
    {
        name: "Défis",
        description: "Relevez des défis dans votre ville, gagnez des points et grimpez dans le classement UrbanQuest.",
        icon: <Target className="h-6 w-6" />,
        href: "/challenges",
        image: PlaceHolderImages.find(p => p.id === 'service-challenges')?.imageUrl || ''
    },
]

export default function HomePage() {
    const [activeService, setActiveService] = useState(services[0]);

    return (
        <div className="flex flex-col min-h-screen dark:bg-background">
          <Navbar />
          <main className="flex-grow">
                <section className="relative bg-gradient-to-br from-primary/10 via-background to-background text-center py-20 md:py-32">
                    <div className="container mx-auto px-4 relative z-10">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-foreground">
                            L'écosystème qui simplifie votre vie étudiante.
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
                            Trouvez un logement, partagez un trajet, réussissez vos cours, relevez des défis et ne manquez aucun événement.
                        </p>
                        <div className="mt-8 flex justify-center items-center gap-4">
                            <Button asChild size="lg">
                                <Link href="/register">Rejoindre la communauté</Link>
                            </Button>
                             <Button asChild size="lg" variant="outline">
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                           <div className="flex flex-col gap-4">
                               {services.map(service => (
                                   <div
                                     key={service.name}
                                     onMouseEnter={() => setActiveService(service)}
                                     className={cn(
                                        "p-6 rounded-lg cursor-pointer border-2 transition-all duration-300",
                                        activeService.name === service.name ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"
                                     )}
                                   >
                                       <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-full transition-colors",
                                                activeService.name === service.name ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                            )}>
                                                {service.icon}
                                            </div>
                                           <h3 className="font-bold text-lg">{service.name}</h3>
                                       </div>
                                   </div>
                               ))}
                           </div>
                           <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl">
                               <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeService.name}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="absolute inset-0 h-full w-full"
                                    >
                                        <Image
                                          src={activeService.image}
                                          alt={activeService.name}
                                          fill
                                          className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                        <div className="absolute bottom-0 left-0 p-6 text-white">
                                            <div className="flex items-center gap-4 mb-2">
                                                 <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                                                    {activeService.icon}
                                                 </div>
                                                 <h3 className="text-2xl font-bold">{activeService.name}</h3>
                                            </div>
                                            <p className="max-w-md text-white/90">{activeService.description}</p>
                                            <Button asChild variant="secondary" className="mt-4">
                                                <Link href={activeService.href}>Explorer <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                            </Button>
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                           </div>
                        </div>
                    </div>
                </section>
          </main>
          <Footer />
        </div>
      );
}

    