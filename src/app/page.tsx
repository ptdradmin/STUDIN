
'use client';

import { Card } from '@/components/ui/card';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Bed, Car, GraduationCap, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const services = [
    {
        name: "Logements",
        icon: <Bed className="h-8 w-8 text-primary"/>,
        href: "/housing"
    },
    {
        name: "Covoiturage",
        icon: <Car className="h-8 w-8 text-primary"/>,
        href: "/carpooling"
    },
     {
        name: "Tutorat",
        icon: <GraduationCap className="h-8 w-8 text-primary"/>,
        href: "/tutoring"
    },
     {
        name: "Événements",
        icon: <PartyPopper className="h-8 w-8 text-primary"/>,
        href: "/events"
    },
]

export default function Home() {

  return (
    <div className="flex flex-col min-h-screen">
       <Navbar />
       <main className="flex-grow">
            <section className="relative bg-gradient-to-br from-primary to-secondary text-primary-foreground text-center py-20 md:py-32">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519452575417-5e04802f7b20?w=1200')" }}
                ></div>
                <div className="container mx-auto px-4 relative">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
                        L'écosystème qui simplifie votre vie étudiante.
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl opacity-90">
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
                             <Link href={service.href} key={service.name}>
                                <Card className="h-full text-center p-6 shadow-md transition-transform hover:-translate-y-2 hover:shadow-xl flex flex-col items-center justify-center gap-4">
                                     {service.icon}
                                    <span className="font-semibold text-lg">{service.name}</span>
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
