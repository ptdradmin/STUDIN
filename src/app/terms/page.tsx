
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-foreground">Conditions d'Utilisation</h1>
                <p className="mt-2 text-lg text-muted-foreground">Dernière mise à jour le 28 Juillet 2024</p>
            </div>
        </div>
        <div className="container mx-auto px-4 py-8 md:py-16">
             <Card className="py-10 px-6 max-w-4xl mx-auto shadow-lg">
                <CardContent className="prose max-w-none">
                    <p className="lead">Bienvenue sur STUD'IN. En accédant à notre application ou à nos services, vous acceptez d'être lié par les présentes Conditions d'Utilisation. Veuillez les lire attentivement.</p>
                    
                    <h2 className="mt-8 text-2xl font-semibold">1. Acceptation des conditions</h2>
                    <p>En créant un compte ou en utilisant l'application STUD'IN, vous confirmez que vous avez lu, compris et accepté l'ensemble de ces conditions. Si vous n'êtes pas d'accord, vous ne devez pas utiliser le service.</p>
                    
                    <h2 className="mt-6 text-2xl font-semibold">2. Obligations de l'utilisateur</h2>
                    <p>En utilisant STUD'IN, vous vous engagez à :</p>
                    <ul>
                        <li>Fournir des informations exactes, à jour et complètes lors de votre inscription et sur votre profil.</li>
                        <li>Utiliser le service de manière responsable, éthique et légale.</li>
                        <li>Ne pas publier de contenu illégal, haineux, diffamatoire, obscène, frauduleux ou portant atteinte aux droits de tiers.</li>
                        <li>Ne pas usurper l'identité d'une autre personne ou entité.</li>
                        <li>Ne pas utiliser le service à des fins commerciales non autorisées (spam, publicité non sollicitée).</li>
                    </ul>

                    <h2 className="mt-6 text-2xl font-semibold">3. Contenu et Propriété Intellectuelle</h2>
                    <ul>
                        <li><strong>Votre contenu :</strong> Vous conservez tous les droits de propriété sur le contenu que vous publiez sur STUD'IN (annonces, photos, messages, soumissions aux défis). Cependant, vous nous accordez une licence mondiale, non exclusive et libre de droits pour utiliser, héberger, afficher, reproduire et distribuer ce contenu dans le seul but de faire fonctionner et d'améliorer nos services.</li>
                        <li><strong>Notre contenu :</strong> Le service STUD'IN, y compris son logo, son design, ses textes, ses graphiques et son code, est la propriété exclusive de STUD'IN et est protégé par les lois sur le droit d'auteur et la propriété intellectuelle.</li>
                    </ul>

                    <h2 className="mt-6 text-2xl font-semibold">4. Responsabilité</h2>
                    <p>STUD'IN est une plateforme de mise en relation. Nous ne sommes pas partie prenante aux accords conclus entre les utilisateurs (par exemple, un contrat de location, un accord de covoiturage, une séance de tutorat ou la réalisation d'un défi).</p>
                    <ul>
                       <li>Nous ne garantissons pas la qualité, la sécurité, ou la légalité des annonces et des services proposés par les utilisateurs, y compris les défis.</li>
                       <li>Vous êtes seul responsable de vos interactions avec les autres utilisateurs. Nous vous encourageons à faire preuve de prudence et de bon sens.</li>
                       <li>Notre responsabilité est limitée au montant que vous nous avez payé (le cas échéant) au cours des 12 derniers mois, dans toute la mesure permise par la loi.</li>
                    </ul>

                    <h2 className="mt-6 text-2xl font-semibold">5. Modération et Résiliation</h2>
                    <p>Nous nous réservons le droit, sans y être obligés, de surveiller, de filtrer ou de supprimer tout contenu qui, à notre seule discrétion, enfreint ces conditions.</p>
                    <p>Nous pouvons suspendre ou résilier votre compte à tout moment, sans préavis, si nous estimons que vous avez violé ces conditions ou que votre comportement nuit à la communauté ou au service.</p>
                    <p>Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application ou en nous contactant.</p>

                    <h2 className="mt-6 text-2xl font-semibold">6. Droit applicable</h2>
                    <p>Les présentes Conditions d'Utilisation sont régies par le droit belge. Tout litige relatif à ces conditions sera soumis à la compétence exclusive des tribunaux de Bruxelles.</p>
                   
                    <div className="text-center py-10 mt-6 bg-muted rounded-lg">
                        <h4 className="text-xl font-semibold">Contact</h4>
                        <p className="text-muted-foreground mt-2">Pour toute question concernant ces conditions, veuillez nous contacter à <a href="mailto:legal@studin.online" className="text-primary hover:underline">legal@studin.online</a>.</p>
                    </div>
                </CardContent>
             </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
