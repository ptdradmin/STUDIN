
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function WhoWeArePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-foreground">
              Qui Sommes-Nous ?
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
              L'équipe derrière la révolution de la vie étudiante.
            </p>
          </div>
        </section>
        
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
              <div className="mx-auto mb-12 max-w-3xl text-center">
                  <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Fondateur & Développeur
                  </h2>
              </div>
              <Card className="max-w-4xl mx-auto shadow-lg">
                <CardContent className="flex flex-col items-center gap-8 p-8 sm:flex-row">
                  <Avatar className="h-32 w-32 flex-shrink-0">
                     <AvatarImage src="https://api.dicebear.com/7.x/micah/svg?seed=guilhermedoba" alt="Gui Doba"/>
                    <AvatarFallback>GD</AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left space-y-4">
                    <div>
                      <p className="text-xl font-semibold">Gui Doba — Étudiant en informatique</p>
                    </div>
                    <p className="text-muted-foreground">
                      Je m’appelle Gui Doba. Étudiant en informatique, je suis passionné par la création d’applications utiles pour les élèves et étudiants. Depuis mes premières années d’études, je m’intéresse aux projets qui résolvent des problèmes concrets.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <div className="max-w-4xl mx-auto mt-8 text-muted-foreground space-y-4">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                  {['Trouver un logement', 'Organiser un covoiturage', "Obtenir de l’aide scolaire", "Repérer les événements importants de la vie étudiante"].map(item => (
                     <li key={item} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0"/>
                        <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  J’ai créé STUD’IN parce que je connais les difficultés rencontrées par les étudiants, au secondaire et au supérieur. Je voulais un outil simple et accessible, rassemblant tous les services essentiels dans un seul espace.
                </p>
                 <p>
                  Je continue d’apprendre et d’améliorer l’application grâce aux retours des utilisateurs. Mon objectif : une plateforme fiable, claire et adaptée à la réalité des étudiants.
                </p>
              </div>
          </div>
        </section>

        <section className="bg-muted/40 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Notre Histoire
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                STUD’IN est en cours de développement et vise à devenir l’outil indispensable des étudiants en Belgique francophone.
              </p>
              <p className="mt-4 text-muted-foreground">
                Ce qui a commencé comme un besoin personnel est devenu une aventure collective. Chaque jour, nous innovons pour répondre aux besoins réels des étudiants.
              </p>
            </div>
            <div className="max-w-2xl mx-auto mt-10">
                <h3 className="text-xl font-semibold text-center mb-6">La plateforme centralise :</h3>
                <ul className="space-y-4">
                    <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1"><Check className="h-5 w-5"/></div>
                        <div><strong className="block">Logement :</strong> Trouver un appartement ou une chambre facilement.</div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1"><Check className="h-5 w-5"/></div>
                        <div><strong className="block">Covoiturage :</strong> Organiser des trajets partagés.</div>
                    </li>
                    <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1"><Check className="h-5 w-5"/></div>
                        <div><strong className="block">Tutorat :</strong> Connecter élèves et étudiants avec des tuteurs compétents.</div>
                    </li>
                     <li className="flex items-start gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1"><Check className="h-5 w-5"/></div>
                        <div><strong className="block">Événements :</strong> Repérer les activités importantes liées à la vie étudiante.</div>
                    </li>
                </ul>
                <p className="mt-8 text-center text-lg">
                    Notre ambition : créer une plateforme complète, intuitive et pratique, où chaque étudiant trouve rapidement ce dont il a besoin.
                </p>
            </div>
            <blockquote className="mt-12 max-w-2xl mx-auto text-lg italic text-muted-foreground relative text-center border-l-4 pl-6">
                  <p>« Ce qui a commencé comme un besoin personnel est en train de devenir une aventure collective. »</p>
            </blockquote>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
