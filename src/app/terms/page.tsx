
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-bold">Conditions d'Utilisation</h1>
                    <p className="mt-2 text-lg opacity-90">Règles d'utilisation de notre plateforme.</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                 <Card className="py-10 px-6">
                    <CardContent className="prose max-w-none">
                        <h2 className="text-2xl font-semibold">1. Acceptation des conditions</h2>
                        <p>En utilisant l'application STUD'IN, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'êtes pas d'accord, veuillez ne pas utiliser l'application.</p>
                        
                        <h2 className="mt-6 text-2xl font-semibold">2. Utilisation du service</h2>
                        <p>Vous vous engagez à utiliser STUD'IN de manière responsable et à ne pas publier de contenu illégal, haineux ou inapproprié. Nous nous réservons le droit de suspendre ou de supprimer tout compte qui ne respecterait pas ces règles.</p>

                        <h2 className="mt-6 text-2xl font-semibold">3. Responsabilité</h2>
                        <p>STUD'IN est une plateforme de mise en relation. Nous ne sommes pas responsables des interactions entre utilisateurs, de la qualité des logements, des trajets en covoiturage ou des sessions de tutorat.</p>
                       
                        <div className="text-center py-10 mt-6 bg-muted rounded-lg">
                            <p className="text-muted-foreground">Ceci est un résumé. Les conditions d'utilisation complètes seront disponibles prochainement.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
