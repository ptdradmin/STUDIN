import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Car, BookOpen, PartyPopper } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
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
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                    Une plateforme tout-en-un
                </h2>
              <p className="mt-4 text-lg text-muted-foreground">
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
      </main>
      <Footer />
    </div>
  );
}
