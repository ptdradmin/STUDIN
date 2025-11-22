
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
                    <p className="mt-2 text-lg opacity-90">Mise à jour le 24 Mai 2024</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <Card className="py-10 px-6">
                    <CardContent className="prose max-w-none">
                        <p className="lead">Bienvenue sur STUD'IN. Nous nous engageons à protéger vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre application.</p>
                        
                        <h2 className="mt-8 text-2xl font-semibold">1. Responsable du traitement</h2>
                        <p>STUD'IN, représenté par son fondateur Gui Doba, est le responsable du traitement de vos données personnelles.</p>
                        <p>Pour toute question relative à cette politique, veuillez nous contacter à <a href="mailto:privacy@studin.app">privacy@studin.app</a>.</p>

                        <h2 className="mt-6 text-2xl font-semibold">2. Données que nous collectons</h2>
                        <p>Nous collectons les types de données suivants :</p>
                        <ul>
                            <li><strong>Données d'identité :</strong> Prénom, nom, nom d'utilisateur, photo de profil.</li>
                            <li><strong>Données de contact :</strong> Adresse e-mail.</li>
                            <li><strong>Données de profil :</strong> Université, domaine d'études, biographie.</li>
                            <li><strong>Contenu généré par l'utilisateur :</strong> Annonces (logement, covoiturage, tutorat), publications, photos, commentaires et messages que vous publiez sur la plateforme.</li>
                            <li><strong>Données techniques :</strong> Adresse IP, type de navigateur, fuseau horaire et d'autres technologies sur les appareils que vous utilisez pour accéder à l'application.</li>
                        </ul>

                        <h2 className="mt-6 text-2xl font-semibold">3. Comment nous utilisons vos données</h2>
                        <p>Nous utilisons vos données pour les finalités suivantes :</p>
                        <ul>
                            <li><strong>Fournir et gérer notre service :</strong> Création de votre compte, affichage de votre profil et de votre contenu.</li>
                            <li><strong>Permettre l'interaction :</strong> Faciliter la communication entre les utilisateurs pour les services de logement, covoiturage, etc.</li>
                            <li><strong>Personnaliser votre expérience :</strong> Vous montrer du contenu pertinent.</li>
                            <li><strong>Sécurité :</strong> Protéger la plateforme contre la fraude et les abus.</li>
                            <li><strong>Communication :</strong> Vous envoyer des informations relatives au service (pas de marketing sans votre consentement).</li>
                        </ul>

                        <h2 className="mt-6 text-2xl font-semibold">4. Base juridique du traitement (RGPD)</h2>
                        <p>Nous traitons vos données sur la base de :</p>
                        <ul>
                            <li><strong>L'exécution d'un contrat :</strong> L'utilisation de nos services est régie par nos <a href="/terms">Conditions d'Utilisation</a>, qui constituent un contrat entre vous et nous.</li>
                            <li><strong>Notre intérêt légitime :</strong> Pour améliorer notre service, assurer la sécurité de la plateforme et prévenir la fraude.</li>
                            <li><strong>Votre consentement :</strong> Pour certaines communications marketing optionnelles.</li>
                        </ul>

                         <h2 className="mt-6 text-2xl font-semibold">5. Vos droits en matière de protection des données</h2>
                        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                        <ul>
                            <li><strong>Droit d'accès :</strong> Vous pouvez demander une copie des données que nous détenons sur vous.</li>
                            <li><strong>Droit de rectification :</strong> Vous pouvez demander la correction de données inexactes ou incomplètes.</li>
                            <li><strong>Droit à l'effacement (« droit à l'oubli ») :</strong> Vous pouvez demander la suppression de vos données personnelles.</li>
                            <li><strong>Droit à la limitation du traitement :</strong> Vous pouvez demander de limiter l'utilisation de vos données.</li>
                             <li><strong>Droit à la portabilité des données :</strong> Vous pouvez demander à recevoir vos données dans un format structuré et lisible par machine.</li>
                             <li><strong>Droit d'opposition :</strong> Vous pouvez vous opposer au traitement de vos données pour des raisons tenant à votre situation particulière.</li>
                        </ul>
                        <p>Pour exercer ces droits, veuillez nous contacter à <a href="mailto:privacy@studin.app">privacy@studin.app</a>.</p>

                        <h2 className="mt-6 text-2xl font-semibold">6. Sécurité des données</h2>
                        <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour empêcher que vos données personnelles ne soient accidentellement perdues, utilisées ou consultées de manière non autorisée. L'accès à vos données est limité aux employés et prestataires qui ont un besoin professionnel de les connaître.</p>

                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
