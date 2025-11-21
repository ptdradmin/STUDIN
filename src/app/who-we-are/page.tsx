import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from 'next/image';
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function WhoWeArePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Qui Sommes-Nous ?
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg opacity-90 md:text-xl">
              L'équipe derrière la révolution de la vie étudiante.
            </p>
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
                          Fondateur & Développeur
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
      </main>
      <Footer />
    </div>
  );
}
