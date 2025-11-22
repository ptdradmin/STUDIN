
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const faqs = [
    {
        category: "Général",
        questions: [
            { 
                q: "Qu'est-ce que STUD'IN ?", 
                a: "STUD'IN est une plateforme tout-en-un conçue pour simplifier la vie des étudiants en Belgique francophone. Elle centralise des services essentiels comme la recherche de logement, le covoiturage, le tutorat et la découverte d'événements."
            },
            {
                q: "L'inscription est-elle gratuite ?",
                a: "Oui, l'inscription et l'utilisation de toutes les fonctionnalités de base de STUD'IN sont entièrement gratuites pour les étudiants."
            },
            {
                q: "Qui peut s'inscrire sur STUD'IN ?",
                a: "L'application est principalement destinée aux étudiants de l'enseignement supérieur en Fédération Wallonie-Bruxelles, mais toute personne peut créer un compte."
            },
        ]
    },
    {
        category: "Logement",
        questions: [
            {
                q: "Comment puis-je publier une annonce de logement ?",
                a: "Vous devez avoir un compte utilisateur. Rendez-vous dans la section 'Logement' et cliquez sur 'Ajouter une annonce'. Remplissez ensuite le formulaire avec les détails de votre bien (kot, studio, colocation)."
            },
            {
                q: "STUD'IN vérifie-t-il les annonces ?",
                a: "Nous encourageons les propriétaires à fournir des informations précises. Bien que nous ne visitions pas physiquement les lieux, nous avons des systèmes de signalement pour les annonces frauduleuses. La prudence est toujours recommandée."
            },
        ]
    },
    {
        category: "Covoiturage",
        questions: [
            {
                q: "Comment proposer un trajet en covoiturage ?",
                a: "Allez dans la section 'Covoiturage' et cliquez sur 'Proposer un trajet'. Vous devrez indiquer le lieu de départ, d'arrivée, l'heure et le prix par siège. Seuls les utilisateurs connectés peuvent proposer des trajets."
            },
            {
                q: "Comment sont gérés les paiements pour le covoiturage ?",
                a: "Actuellement, STUD'IN est une plateforme de mise en relation. Le paiement se fait directement entre le conducteur et les passagers selon les modalités qu'ils conviennent."
            },
        ]
    },
    {
        category: "Tutorat",
        questions: [
            {
                q: "Je suis bon en statistiques. Puis-je donner des cours ?",
                a: "Absolument ! Rendez-vous dans la section 'Tutorat' et cliquez sur 'Devenir tuteur'. Vous pourrez y créer votre profil de tuteur, indiquer vos matières, votre niveau et vos tarifs."
            },
            {
                q: "Comment se déroulent les séances de tutorat ?",
                a: "Le tuteur et l'étudiant s'accordent sur les modalités : en ligne, à domicile, sur le campus, etc. STUD'IN facilite la prise de contact."
            },
        ]
    },
    {
        category: "Événements",
        questions: [
            {
                q: "Mon cercle étudiant organise une soirée. Comment l'ajouter ?",
                a: "Si vous avez un compte, allez dans la section 'Événements' et cliquez sur 'Créer un événement'. Vous pourrez y ajouter tous les détails : date, lieu, description, image, etc."
            },
        ]
    },
     {
        category: "Compte et Sécurité",
        questions: [
            {
                q: "Comment puis-je modifier mes informations personnelles ?",
                a: "Vous pouvez modifier vos informations depuis votre page de profil, accessible en cliquant sur votre avatar dans la barre de navigation."
            },
            {
                q: "Comment puis-je supprimer mon compte ?",
                a: "Vous pouvez demander la suppression de votre compte en nous contactant via la section 'Aide'. Toutes vos données seront définitivement effacées conformément au RGPD."
            },
        ]
    },
];

export default function FaqPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold">Questions Fréquemment Posées</h1>
            <p className="mt-2 text-lg opacity-90">Trouvez les réponses à vos questions.</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                {faqs.map((category) => (
                    <div key={category.category} className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2">{category.category}</h2>
                        <Accordion type="single" collapsible className="w-full">
                            {category.questions.map((item) => (
                                <AccordionItem value={item.q} key={item.q}>
                                    <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        {item.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                ))}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
