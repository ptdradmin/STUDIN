
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function PressPage() {
  return (
    <>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold">STUD'IN</h1>
                    </Link>
                </div>
            </header>
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-bold">Espace Presse</h1>
                    <p className="text-lg mt-2 opacity-90">Informations sur les nouveautés et futures mises à jour.</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <Card className="py-10">
                    <CardContent className="prose max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold">STUD'IN : L'Avenir de la Vie Étudiante</h2>
                        <p className="text-lg text-muted-foreground">
                            STUD'IN est une application mobile et web en cours de développement visant à centraliser tous les services essentiels à la vie des étudiants de la Fédération Wallonie-Bruxelles.
                        </p>
                        
                        <h3 className="text-2xl font-semibold mt-10">Feuille de Route (Roadmap)</h3>
                        <ul className="text-left list-disc list-inside mx-auto max-w-md">
                            <li><span className="font-semibold">Phase 1 (En cours):</span> Lancement de la plateforme avec les modules Logement et Social.</li>
                            <li><span className="font-semibold">Phase 2 (Q4 2024):</span> Intégration des modules Covoiturage et Événements.</li>
                            <li><span className="font-semibold">Phase 3 (Q1 2025):</span> Lancement du service de Tutorat et partenariats universitaires.</li>
                        </ul>

                        <div className="text-center py-10 mt-10 bg-muted rounded-lg">
                            <h4 className="text-xl font-semibold">Contact Presse</h4>
                            <p className="text-muted-foreground mt-2">Pour toute demande, veuillez nous contacter à <a href="mailto:presse@studin.app" className="text-primary hover:underline">presse@studin.app</a>.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
    </>
  );
}
