import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Car, BookOpen, PartyPopper } from "lucide-react";
import Image from 'next/image';

const features = [
  {
    icon: <Home className="h-8 w-8" />,
    title: 'Logement',
    description: 'Trouvez un kot, un studio ou une colocation près de votre campus.',
  },
  {
    icon: <Car className="h-8 w-8" />,
    title: 'Covoiturage',
    description: 'Partagez vos trajets et économisez sur vos frais de déplacement.',
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: 'Tutorat',
    description: "Obtenez de l'aide ou proposez vos compétences dans toutes les matières.",
  },
  {
    icon: <PartyPopper className="h-8 w-8" />,
    title: 'Événements',
    description: 'Ne manquez aucune soirée, conférence ou activité étudiante.',
  },
];


export default function AboutPage() {
  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            À Propos de STUD'IN
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg opacity-90 md:text-xl">
            Notre mission : simplifier la vie des étudiants de la Fédération Wallonie-Bruxelles.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-lg text-muted-foreground">
              STUD'IN est né d'un constat simple : la vie étudiante est remplie de défis qui vont bien au-delà des salles de cours. Trouver un logement, se déplacer, réussir ses études ou simplement être au courant des activités de son campus peut être un véritable casse-tête. Notre objectif est de rassembler tous ces services essentiels sur une plateforme unique, intuitive et communautaire.
            </p>
          </div>
        </div>
      </section>

       <section id="features" className="bg-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Un Écosystème Complet
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full text-center border-0 shadow-none bg-transparent">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardContent className="pt-2 text-muted-foreground">
                    <p>{feature.description}</p>
                  </CardContent>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Le Fondateur
                </h2>
            </div>
            <Card className="max-w-4xl mx-auto shadow-lg">
              <CardContent className="flex flex-col items-center gap-8 p-8 sm:flex-row">
                <Avatar className="h-32 w-32">
                   <Image src="https://picsum.photos/seed/founder/128/128" alt="Gui Doba" width={128} height={128} data-ai-hint="portrait homme"/>
                  <AvatarFallback>GD</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left space-y-4">
                  <div>
                    <p className="text-xl font-semibold">Gui Doba</p>
                    <p className="text-sm text-muted-foreground">
                        Fondateur & CEO
                    </p>
                  </div>
                  <p className="text-muted-foreground">
                    Étudiant en Belgique francophone, Gui Doba a vécu lui-même les difficultés de la vie étudiante. Frustré par l'éparpillement des informations et des services, il a décidé de créer la plateforme qu'il aurait rêvé d'avoir : STUD'IN.
                  </p>
                  <blockquote className="font-code text-lg italic text-muted-foreground border-l-4 pl-4">
                    "Ma vision est de créer un véritable écosystème digital où chaque étudiant de la Fédération Wallonie-Bruxelles peut s'épanouir, soutenu par sa communauté."
                  </blockquote>
                </div>
              </CardContent>
            </Card>
        </div>
      </section>

      <section className="bg-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Notre Histoire
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Actuellement en cours de développement, STUD'IN est un projet né de l'ambition de devenir l'outil indispensable de chaque étudiant en Belgique francophone. L'application est développée avec passion pour répondre concrètement aux défis de la vie étudiante.
            </p>
            <blockquote className="mt-8 font-code text-lg italic text-muted-foreground relative">
                <p className="relative z-10">"Ce qui a commencé comme un besoin personnel est en train de devenir une aventure collective. Chaque jour, nous innovons pour mieux répondre aux besoins réels des étudiants."</p>
            </blockquote>
          </div>
        </div>
      </section>
    </div>
  );
}
