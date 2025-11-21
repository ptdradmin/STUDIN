import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-bold">Politique de Confidentialité</h1>
                    <p className="mt-2 text-lg opacity-90">Votre vie privée est importante pour nous.</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <Card className="py-10 px-6">
                    <CardContent className="prose max-w-none">
                        <h2 className="text-2xl font-semibold">1. Introduction</h2>
                        <p>Bienvenue sur STUD'IN. Nous respectons votre vie privée et nous nous engageons à protéger vos données personnelles. Cette politique de confidentialité vous informera sur la manière dont nous traitons vos données personnelles lorsque vous utilisez notre application.</p>
                        
                        <h2 className="mt-6 text-2xl font-semibold">2. Données que nous collectons</h2>
                        <p>Nous pouvons collecter, utiliser, stocker et transférer différents types de données personnelles vous concernant, que nous avons regroupées comme suit :</p>
                        <ul>
                            <li>Données d'identité : prénom, nom, nom d'utilisateur.</li>
                            <li>Données de contact : adresse e-mail.</li>
                            <li>Données de profil : université, domaine d'études.</li>
                        </ul>

                        <h2 className="mt-6 text-2xl font-semibold">3. Comment nous utilisons vos données</h2>
                        <p>Nous n'utiliserons vos données personnelles que lorsque la loi nous le permettra. Le plus souvent, nous utiliserons vos données personnelles dans les circonstances suivantes :</p>
                        <ul>
                            <li>Pour vous enregistrer en tant que nouvel utilisateur.</li>
                            <li>Pour gérer notre relation avec vous.</li>
                            <li>Pour vous permettre de participer aux fonctionnalités interactives de notre service.</li>
                        </ul>
                        <div className="text-center py-10 mt-6 bg-muted rounded-lg">
                            <p className="text-muted-foreground">Ceci est un document de démonstration. Le contenu complet sera disponible prochainement.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
