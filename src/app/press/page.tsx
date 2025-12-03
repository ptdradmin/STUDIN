
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PressPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-foreground">Espace Presse</h1>
                <p className="text-lg mt-2 text-muted-foreground">Informations sur les nouveautés et futures mises à jour.</p>
            </div>
        </div>
        <div className="container mx-auto px-4 py-8 md:py-16">
            <Card className="py-10 max-w-3xl mx-auto shadow-lg">
                <CardContent className="prose max-w-none text-center">
                    <h2 className="text-3xl font-bold">STUD'IN : L'Avenir de la Vie Étudiante</h2>
                    <p className="text-lg text-muted-foreground">
                        STUD'IN est une application mobile et web en cours de développement visant à centraliser tous les services essentiels à la vie des étudiants de la Fédération Wallonie-Bruxelles.
                    </p>
                    
                    <h3 className="text-2xl font-semibold mt-10">Feuille de Route (Roadmap)</h3>
                    <ul className="text-left list-disc list-inside mx-auto max-w-md">
                        <li><span className="font-semibold">Phase 1 (En cours):</span> Lancement de la plateforme avec les modules Logement, Social et Marché aux Livres.</li>
                        <li><span className="font-semibold">Phase 2 (Q4 2024):</span> Intégration des modules Covoiturage et Événements.</li>
                        <li><span className="font-semibold">Phase 3 (Q1 2025):</span> Lancement du service de Tutorat et partenariats universitaires.</li>
                    </ul>

                    <div className="text-center py-10 mt-10 bg-muted rounded-lg">
                        <h4 className="text-xl font-semibold">Contact Presse</h4>
                        <p className="text-muted-foreground mt-2">Pour toute demande, veuillez nous contacter à <a href="mailto:presse@studin.online" className="text-primary hover:underline">presse@studin.online</a>.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
