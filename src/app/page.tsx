import {Button} from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Home as HomeIcon, Car, BookOpen, PartyPopper} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const features = [
  {
    icon: <HomeIcon className="h-10 w-10" />,
    title: 'Logement',
    description:
      'Trouvez le kot, studio ou colocation parfait près de votre campus',
    href: '/housing',
  },
  {
    icon: <Car className="h-10 w-10" />,
    title: 'Covoiturage',
    description:
      'Partagez vos trajets et économisez sur vos frais de déplacement',
    href: '/carpooling',
  },
  {
    icon: <BookOpen className="h-10 w-10" />,
    title: 'Tutorat',
    description:
      "Obtenez de l'aide ou proposez vos compétences dans toutes les matières",
    href: '/tutoring',
  },
  {
    icon: <PartyPopper className="h-10 w-10" />,
    title: 'Événements',
    description: 'Ne manquez aucune soirée, conférence ou activité étudiante',
    href: '/events',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Bienvenue sur STUD'IN
          </h1>
          <p className="mt-4 max-w-2xl text-lg opacity-90 md:text-xl">
            L'écosystème étudiant de Wallonie-Bruxelles
          </p>
          <p className="mt-6 max-w-3xl leading-relaxed opacity-95">
            Trouvez un logement, partagez un trajet, recevez de l'aide ou
            découvrez les meilleurs événements près de votre campus.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/register">Rejoindre STUD'IN</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white">
              <Link href="/housing">Explorer les services</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Nos Services
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tout ce dont vous avez besoin pour une vie étudiante épanouie.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Link href={feature.href} key={feature.title}>
                <Card className="h-full transform-gpu text-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription className="pt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Notre Mission
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              STUD'IN est né d'un constat simple : la vie étudiante est remplie
              de défis qui vont bien au-delà des salles de cours. Notre
              objectif est de rassembler tous les services essentiels sur une
              plateforme unique, intuitive et communautaire.
            </p>
            <Card className="mt-12 text-left shadow-lg">
              <CardContent className="flex flex-col items-center gap-6 p-8 sm:flex-row">
                <Avatar className="h-24 w-24">
                   <Image src="https://picsum.photos/seed/founder/100/100" alt="Gui Doba" width={100} height={100} data-ai-hint="portrait homme"/>
                  <AvatarFallback>GD</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <p className="font-code text-lg italic text-muted-foreground">
                    "Ce qui a commencé comme un besoin personnel est devenu une
                    aventure collective."
                  </p>
                  <p className="mt-4 text-lg font-semibold">Gui Doba</p>
                  <p className="text-sm text-muted-foreground">
                    Fondateur & CEO
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
