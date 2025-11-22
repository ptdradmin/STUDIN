
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bed, Car, GraduationCap, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PageSkeleton } from '@/components/page-skeleton';

const services = [
    {
        name: "Logements",
        description: "Trouvez le kot ou studio parfait.",
        icon: <Bed className="h-8 w-8 text-primary"/>,
        href: "/housing"
    },
    {
        name: "Covoiturage",
        description: "Partagez vos trajets, économisez.",
        icon: <Car className="h-8 w-8 text-primary"/>,
        href: "/carpooling"
    },
     {
        name: "Tutorat",
        description: "De l'aide pour réussir vos examens.",
        icon: <GraduationCap className="h-8 w-8 text-primary"/>,
        href: "/tutoring"
    },
     {
        name: "Événements",
        description: "Découvrez les soirées étudiantes.",
        icon: <PartyPopper className="h-8 w-8 text-primary"/>,
        href: "/events"
    },
]

export default function HomePage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user) {
            router.replace('/social');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || user) {
        return <PageSkeleton />;
    }
    
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
                            Trouvez un logement, partagez un trajet, réussissez vos cours et ne manquez aucun événement.
                        </p>
                        <div className="mt-8">
                            <Button asChild size="lg">
                                <Link href="/register">Rejoindre la communauté</Link>
                            </Button>
                        </div>
                    </div>
                </section>
                
                <section id="features" className="py-16 md:py-24 bg-background">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto mb-12 max-w-3xl text-center">
                            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Explorez Nos Services
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                            Tout ce dont vous avez besoin pour une vie étudiante épanouie.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {services.map(service => (
                                 <Link href={service.href} key={service.name} className="block h-full group">
                                    <Card className="h-full text-center p-6 shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl flex flex-col items-center justify-start gap-4">
                                         <div className="p-4 bg-primary/10 rounded-full transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                            {service.icon}
                                         </div>
                                        <h3 className="font-bold text-lg">{service.name}</h3>
                                        <p className="text-sm text-muted-foreground">{service.description}</p>
                                    </Card>
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
