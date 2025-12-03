
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Car, BookOpen, PartyPopper, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const features = [
  {
    icon: <Home className="h-8 w-8" />,
    title: 'Logement',
    description: 'Trouvez un kot, un studio ou une colocation près de votre campus.',
    href: "/housing",
  },
  {
    icon: <Car className="h-8 w-8" />,
    title: 'Covoiturage',
    description: 'Partagez vos trajets et économisez sur vos frais de déplacement.',
    href: "/carpooling",
  },
  {
    icon: <BookOpen className="h-8 w-8" />,
    title: 'Tutorat',
    description: "Obtenez de l'aide ou proposez vos compétences dans toutes les matières.",
    href: "/tutoring",
  },
  {
    icon: <PartyPopper className="h-8 w-8" />,
    title: 'Événements',
    description: 'Ne manquez aucune soirée, conférence ou activité étudiante.',
    href: "/events",
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: 'Défis',
    description: 'Gamifiez votre quotidien et explorez votre ville autrement.',
    href: "/challenges",
  },
];


export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-foreground">
              À Propos de STUD'IN
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
              Notre mission : simplifier la vie des étudiants de la Fédération Wallonie-Bruxelles.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                    Une plateforme tout-en-un
                </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                STUD'IN est né d'un constat simple : la vie étudiante est remplie de défis qui vont bien au-delà des salles de cours. Trouver un logement, se déplacer, réussir ses études ou simplement être au courant des activités de son campus peut être un véritable casse-tête. Notre objectif est de rassembler tous ces services essentiels sur une plateforme unique, intuitive et communautaire.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="bg-muted/40 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Un Écosystème Complet
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
              {features.map((feature) => (
                 <Link href={feature.href} key={feature.title} className="block h-full">
                  <Card className="h-full text-center shadow-lg transition-transform hover:-translate-y-2">
                    <CardHeader>
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        <p>{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24">
           <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Prêt à nous rejoindre ?</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Créez votre compte gratuitement et découvrez une nouvelle façon de vivre votre vie étudiante.
              </p>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/register">S'inscrire sur STUD'IN</Link>
                </Button>
              </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
