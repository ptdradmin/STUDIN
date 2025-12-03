
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function CommunityRulesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-foreground">Règles de la Communauté</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Ensemble, créons un environnement sûr et respectueux.</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8 md:py-16">
                 <Card className="py-10 px-6 max-w-4xl mx-auto shadow-lg">
                    <CardContent className="prose max-w-none">
                        <p className="lead">Bienvenue dans la communauté STUD'IN ! Pour que cette plateforme reste un lieu d'échange positif et constructif pour tous, nous vous demandons de respecter les règles suivantes. Tout manquement pourra entraîner la suppression de contenu, voire la suspension de votre compte.</p>
                        
                        <h2 className="mt-8 text-2xl font-semibold">1. Soyez respectueux</h2>
                        <p>Les insultes, le harcèlement, les discours haineux, la discrimination (basée sur l'origine, la religion, le genre, l'orientation sexuelle, etc.) et les menaces ne sont pas tolérés. Traitez les autres comme vous aimeriez être traité.</p>

                        <h2 className="mt-6 text-2xl font-semibold">2. Publiez du contenu approprié</h2>
                        <p>Ne publiez pas de contenu :</p>
                        <ul>
                            <li>Violent, graphique ou pornographique.</li>
                            <li>Illégal ou qui encourage des activités illégales.</li>
                            <li>Qui porte atteinte à la vie privée d'autrui (partage d'informations personnelles sans consentement).</li>
                            <li>Constituant du spam ou de la publicité non sollicitée.</li>
                        </ul>
                         <p>Le contenu soumis dans le cadre des défis doit également respecter ces règles.</p>

                        <h2 className="mt-6 text-2xl font-semibold">3. Soyez honnête et authentique</h2>
                        <ul>
                           <li>Ne vous faites pas passer pour quelqu'un d'autre (usurpation d'identité).</li>
                           <li>Ne publiez pas d'informations fausses ou trompeuses, que ce soit dans les annonces (logement, covoiturage), les publications ou les défis.</li>
                           <li>La manipulation des avis, des likes, des commentaires ou des résultats des défis est interdite.</li>
                        </ul>

                        <h2 className="mt-6 text-2xl font-semibold">4. Respectez la propriété intellectuelle</h2>
                        <p>Ne publiez que du contenu que vous avez créé ou que vous avez le droit de partager. Ne violez pas les droits d'auteur, les marques ou les secrets commerciaux.</p>

                        <h2 className="mt-6 text-2xl font-semibold">5. Signalez les comportements inappropriés</h2>
                        <p>Si vous voyez un contenu ou un comportement qui enfreint ces règles, utilisez les outils de signalement mis à votre disposition sur la plateforme. Cela nous aide à maintenir un environnement sûr pour tous.</p>
                       
                        <div className="text-center py-10 mt-6 bg-muted rounded-lg">
                            <h4 className="text-xl font-semibold">Merci de votre contribution</h4>
                            <p className="text-muted-foreground mt-2">En respectant ces règles, vous contribuez à faire de STUD'IN une communauté positive et bienveillante.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
      </main>
      <Footer />
    </div>
  );
}
