
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Download, Mail, Rocket, Users, Milestone } from "lucide-react";
import Link from "next/link";

export default function PressPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-foreground">Espace Presse</h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Bienvenue dans l'espace presse de STUD'IN. Retrouvez ici toutes les informations, ressources et actualités concernant notre plateforme.
                </p>
            </div>
        </section>
        <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="grid lg:grid-cols-3 gap-8">

              {/* Colonne principale */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>STUD'IN : L'écosystème qui simplifie la vie étudiante</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none text-muted-foreground">
                      <p>
                        Lancée avec l'ambition de devenir l'outil indispensable des étudiants en Belgique francophone, STUD'IN est une application mobile et web qui centralise tous les services essentiels à une vie étudiante épanouie. De la recherche de logement au covoiturage, en passant par le tutorat et la découverte d'événements, notre mission est de connecter la communauté étudiante et de résoudre ses défis quotidiens.
                      </p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle>Feuille de Route (Roadmap)</CardTitle>
                        <CardDescription>Nos prochaines étapes vers une expérience étudiante complète.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-4">
                           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1"><Rocket className="h-5 w-5"/></div>
                            <div>
                                <h4 className="font-semibold">Phase 1 (Actuelle)</h4>
                                <p className="text-sm text-muted-foreground">Lancement de la plateforme avec les fonctionnalités sociales, le logement, et le marché aux livres.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1"><Milestone className="h-5 w-5"/></div>
                            <div>
                                <h4 className="font-semibold">Phase 2 (Prévue Q4 2024)</h4>
                                <p className="text-sm text-muted-foreground">Intégration des modules Covoiturage et Événements, avec un système de réservation et de billetterie.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0 mt-1"><Users className="h-5 w-5"/></div>
                            <div>
                                <h4 className="font-semibold">Phase 3 (Prévue Q1 2025)</h4>
                                <p className="text-sm text-muted-foreground">Déploiement du service de Tutorat, des Défis gamifiés et consolidation des partenariats avec les institutions.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
              </div>

              {/* Colonne latérale */}
              <div className="space-y-8">
                 <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Kit Presse</CardTitle>
                      <CardDescription>Logos, visuels et informations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Button className="w-full">
                         <Download className="mr-2 h-4 w-4" />
                         Télécharger le Kit Presse
                       </Button>
                    </CardContent>
                </Card>
                 <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle>Contact</CardTitle>
                      <CardDescription>Pour toute demande d'interview ou d'information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-primary" />
                        <a href="mailto:presse@stud-in.com" className="text-sm hover:underline">presse@stud-in.com</a>
                      </div>
                       <Button variant="outline" className="w-full" asChild>
                         <Link href="/contact">Formulaire de contact</Link>
                       </Button>
                    </CardContent>
                </Card>
              </div>

            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
