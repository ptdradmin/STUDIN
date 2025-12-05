
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-foreground">Politique de Confidentialité</h1>
                <p className="mt-2 text-lg text-muted-foreground">Dernière mise à jour le 5 Décembre 2025</p>
            </div>
        </div>
        <div className="container mx-auto px-4 py-8 md:py-16">
            <Card className="py-10 px-6 max-w-4xl mx-auto shadow-lg">
                <CardContent className="prose max-w-none">
                    <p className="lead">Bienvenue sur STUD'IN. Nous nous engageons à protéger votre vie privée et vos données personnelles. Cette politique de confidentialité a pour but de vous informer sur la manière dont nous collectons, utilisons, partageons et protégeons vos informations lorsque vous utilisez notre plateforme.</p>
                    
                    <h2 className="mt-8 text-2xl font-semibold">1. Responsable du traitement</h2>
                    <p>STUD'IN, représenté par son fondateur Gui Doba, est le responsable du traitement de vos données personnelles.</p>
                    <p>Pour toute question relative à cette politique ou pour exercer vos droits, veuillez nous contacter à l'adresse <a href="mailto:privacy@stud-in.com">privacy@stud-in.com</a>.</p>

                    <h2 className="mt-6 text-2xl font-semibold">2. Données que nous collectons</h2>
                    <p>Nous collectons plusieurs types de données pour vous fournir et améliorer nos services :</p>
                    <ul>
                        <li><strong>Données d'identification :</strong> Prénom, nom, nom d'utilisateur, photo de profil.</li>
                        <li><strong>Données de contact :</strong> Adresse e-mail, numéro de téléphone (optionnel).</li>
                        <li><strong>Données de profil académique :</strong> Université, domaine d'études.</li>
                        <li><strong>Contenu généré par l'utilisateur (CGU) :</strong> Annonces (logement, covoiturage, tutorat, marché aux livres), publications, photos, biographie, commentaires, soumissions aux défis (photos, textes) et messages que vous publiez ou échangez sur la plateforme.</li>
                        <li><strong>Données techniques :</strong> Adresse IP, type de navigateur, système d'exploitation, informations sur les appareils, et données de navigation sur notre service.</li>
                        <li><strong>Données de localisation :</strong> Nous pouvons collecter des données de localisation approximatives (ville) pour personnaliser les services comme le logement ou les événements. La localisation précise n'est utilisée qu'avec votre consentement explicite, par exemple pour afficher votre position sur une carte dans le cadre d'un défi.</li>
                    </ul>

                    <h2 className="mt-6 text-2xl font-semibold">3. Comment nous utilisons vos données</h2>
                    <p>Vos données sont utilisées pour les finalités suivantes :</p>
                    <ul>
                        <li><strong>Fourniture du service :</strong> Créer et gérer votre compte, héberger votre contenu, et vous permettre d'utiliser les fonctionnalités de l'application (y compris la participation aux défis).</li>
                        <li><strong>Mise en relation :</strong> Faciliter la communication entre les utilisateurs pour les services de logement, covoiturage, tutorat, marché aux livres, événements et défis.</li>
                        <li><strong>Personnalisation :</strong> Vous proposer du contenu, des annonces et des événements pertinents en fonction de votre profil et de votre localisation.</li>
                        <li><strong>Sécurité et modération :</strong> Protéger la plateforme contre la fraude, les abus, et faire respecter nos conditions d'utilisation.</li>
                        <li><strong>Communication :</strong> Vous envoyer des notifications importantes relatives au service (par exemple, une confirmation de réservation) et, avec votre consentement, des newsletters ou des offres promotionnelles.</li>
                        <li><strong>Amélioration du service :</strong> Analyser l'utilisation de la plateforme pour comprendre comment l'améliorer et développer de nouvelles fonctionnalités.</li>
                    </ul>

                     <h2 className="mt-6 text-2xl font-semibold">4. Partage de vos données</h2>
                    <p>Nous ne vendons jamais vos données personnelles. Nous ne les partageons qu'avec des tiers dans les cas suivants :</p>
                    <ul>
                       <li><strong>Autres utilisateurs :</strong> Certaines de vos informations (nom, photo de profil, annonces) sont visibles par d'autres utilisateurs pour permettre le fonctionnement normal de la plateforme (par exemple, un propriétaire verra le nom d'un étudiant intéressé).</li>
                       <li><strong>Fournisseurs de services :</strong> Nous faisons appel à des fournisseurs pour l'hébergement des données (par exemple, Firebase de Google). Ces fournisseurs sont contractuellement tenus de protéger vos données.</li>
                       <li><strong>Obligations légales :</strong> Nous pouvons divulguer vos informations si la loi l'exige ou pour répondre à une demande légale d'une autorité publique.</li>
                    </ul>


                    <h2 className="mt-6 text-2xl font-semibold">5. Vos droits en matière de protection des données (RGPD)</h2>
                    <p>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</p>
                    <ul>
                        <li><strong>Droit d'accès :</strong> Vous pouvez demander une copie des données que nous détenons sur vous.</li>
                        <li><strong>Droit de rectification :</strong> Vous pouvez corriger les données inexactes ou incomplètes depuis votre page de profil ou en nous contactant.</li>
                        <li><strong>Droit à l'effacement (« droit à l'oubli ») :</strong> Vous pouvez demander la suppression de votre compte et des données associées.</li>
                        <li><strong>Droit à la limitation du traitement :</strong> Vous pouvez nous demander de suspendre le traitement de vos données dans certaines circonstances.</li>
                         <li><strong>Droit à la portabilité des données :</strong> Vous pouvez demander à recevoir vos données dans un format structuré, couramment utilisé et lisible par machine.</li>
                         <li><strong>Droit d'opposition :</strong> Vous pouvez vous opposer au traitement de vos données, notamment à des fins de marketing direct.</li>
                    </ul>
                    <p>Pour exercer ces droits, veuillez nous contacter à <a href="mailto:privacy@stud-in.com">privacy@stud-in.com</a>.</p>

                    <h2 className="mt-6 text-2xl font-semibold">6. Sécurité des données</h2>
                    <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées, telles que le chiffrement des données en transit et au repos, et le contrôle strict des accès, pour protéger vos données personnelles contre la perte, l'utilisation abusive ou l'altération.</p>

                     <h2 className="mt-6 text-2xl font-semibold">7. Conservation des données</h2>
                    <p>Nous conservons vos données personnelles aussi longtemps que votre compte est actif et pour une durée raisonnable par la suite, afin de respecter nos obligations légales (par exemple, en matière de facturation ou de litiges) ou pour des besoins d'archivage. Vous pouvez demander la suppression de votre compte à tout moment.</p>

                     <h2 className="mt-6 text-2xl font-semibold">8. Modifications de cette politique</h2>
                    <p>Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons de tout changement important par e-mail ou via une notification dans l'application. La date de la "dernière mise à jour" en haut de cette page indique quand les derniers changements ont été effectués.</p>

                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
