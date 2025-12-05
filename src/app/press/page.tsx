
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Download, Mail, DownloadCloud } from "lucide-react";
import Link from "next/link";
import { LogoIcon } from "@/components/logo-icon";

const brandColors = [
    { name: 'Primary', hex: '#8B5CF6', hsl: '262 84% 60%' },
    { name: 'Background', hex: '#09090b', hsl: '240 10% 3.9%' },
    { name: 'Card', hex: '#161618', hsl: '240 4% 9%' },
    { name: 'Foreground', hex: '#fcfcfd', hsl: '0 0% 98%' },
]

export default function PressPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-foreground">Espace Presse</h1>
                <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Toutes les ressources et informations pour parler de STUD'IN.
                </p>
            </div>
        </section>

        <div className="container mx-auto px-4 py-12 md:py-20 space-y-16">
            
            {/* Section Mission & Fondateur */}
            <section className="max-w-4xl mx-auto">
                <Card className="shadow-lg overflow-hidden">
                  <CardContent className="p-8 md:p-12">
                      <h2 className="text-3xl font-bold text-center mb-8">Notre Mission</h2>
                      <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto">
                        Simplifier radicalement la vie des étudiants en Belgique francophone en centralisant tous les services essentiels — logement, covoiturage, tutorat, événements — sur une plateforme unique, intuitive et communautaire.
                      </p>

                      <blockquote className="mt-10 text-center text-lg italic text-foreground relative border-l-4 border-primary pl-6 max-w-xl mx-auto">
                        « J'ai créé STUD'IN pour résoudre les problèmes que je rencontrais en tant qu'étudiant. Mon but est de transformer cette expérience souvent complexe en une aventure simple et connectée. »
                        <footer className="mt-4 text-sm not-italic font-semibold text-primary">
                            — Gui Doba, Fondateur de STUD'IN
                        </footer>
                      </blockquote>
                  </CardContent>
                </Card>
            </section>

            {/* Section Ressources de marque */}
            <section className="max-w-4xl mx-auto">
                 <h2 className="text-3xl font-bold text-center mb-8">Ressources de Marque</h2>
                 <Card>
                    <CardHeader>
                      <CardTitle>Logos</CardTitle>
                      <CardDescription>Utilisez notre logo officiel. Faites un clic droit pour enregistrer.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col items-center justify-center gap-4 p-6 bg-background rounded-lg border">
                            <LogoIcon className="h-16 w-16" />
                            <span className="text-sm font-medium">Icone (sombre)</span>
                        </div>
                         <div className="flex flex-col items-center justify-center gap-4 p-6 bg-foreground rounded-lg border">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="h-16 w-16">
                              <rect width="100" height="100" rx="20" fill="hsl(var(--background))"></rect>
                              <text x="50%" y="50%" fontFamily="var(--font-headline), sans-serif" fontSize="80" fontWeight="bold" fill="hsl(var(--primary))" textAnchor="middle" dy=".38em">S</text>
                            </svg>
                            <span className="text-sm font-medium text-background">Icone (clair)</span>
                        </div>
                    </CardContent>
                 </Card>
                 <Card className="mt-6">
                     <CardHeader>
                      <CardTitle>Couleurs</CardTitle>
                      <CardDescription>Notre palette de couleurs officielle.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {brandColors.map(color => (
                            <div key={color.name}>
                                <div className="h-16 w-full rounded-lg" style={{ backgroundColor: color.hex }}></div>
                                <p className="text-sm font-semibold mt-2">{color.name}</p>
                                <p className="text-xs text-muted-foreground">{color.hex}</p>
                            </div>
                        ))}
                    </CardContent>
                 </Card>
                 <div className="text-center mt-8">
                    <Button size="lg">
                        <DownloadCloud className="mr-2 h-5 w-5"/>
                        Télécharger le Kit Presse complet
                    </Button>
                 </div>
            </section>

             {/* Section Contact */}
            <section className="max-w-4xl mx-auto text-center">
                 <h2 className="text-3xl font-bold mb-4">Contact Presse</h2>
                 <p className="text-muted-foreground mb-6">Pour toute demande d'interview, d'information complémentaire ou de collaboration.</p>
                 <Button asChild variant="outline" size="lg">
                    <Link href="mailto:presse@stud-in.com">
                        <Mail className="mr-2 h-5 w-5"/>
                        presse@stud-in.com
                    </Link>
                 </Button>
            </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}
