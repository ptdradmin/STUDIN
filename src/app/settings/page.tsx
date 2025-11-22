
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import {
  Bell,
  ChevronRight,
  Compass,
  Film,
  HelpCircle,
  Info,
  Lock,
  Mail,
  MessageSquare,
  Palette,
  Search,
  Shield,
  Trash2,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const SettingsItem = ({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-4">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

const SettingsLink = ({
  title,
  href = "#",
}: {
  title:string;
  href?: string;
}) => (
    <Link href={href} className="flex items-center justify-between py-4 hover:bg-muted/50 -mx-6 px-6 rounded-md">
        <p className="font-medium">{title}</p>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
);


export default function SettingsPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    if (auth) {
      try {
        await signOut(auth);
        toast({
            title: "Déconnexion réussie",
            description: "À bientôt !",
        });
        router.push('/');
      } catch (error) {
        console.error("Erreur de déconnexion: ", error);
        toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de se déconnecter.",
        });
      }
    }
  };


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold">Paramètres</h1>
            <p className="mt-2 text-lg opacity-90">
              Gérez les paramètres de votre compte et de l'application
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-2xl">
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full" defaultValue="account">
                <AccordionItem value="account">
                  <AccordionTrigger className="px-6 py-4 text-lg font-semibold">
                    <div className="flex items-center gap-3">
                      <User />
                      Paramètres du compte
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 space-y-2">
                     <SettingsLink title="Informations personnelles" href="/profile" />
                     <SettingsLink title="Mot de passe" />
                     <SettingsLink title="Comptes liés" />
                     <Button variant="destructive" className="w-full mt-4" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                     </Button>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="privacy">
                  <AccordionTrigger className="px-6 py-4 text-lg font-semibold">
                    <div className="flex items-center gap-3">
                      <Shield />
                      Confidentialité
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <SettingsItem
                      icon={<User className="h-5 w-5"/>}
                      title="Profil privé"
                      description="Seuls les abonnés que vous approuvez peuvent voir votre profil."
                      action={<Switch id="private-profile" />}
                    />
                    <SettingsItem
                      icon={<Trash2 className="h-5 w-5"/>}
                      title="Effacer l'historique de recherche"
                      action={<Button variant="outline" size="sm">Effacer</Button>}
                    />
                    <SettingsLink title="Liste des utilisateurs bloqués" />
                    <SettingsLink title="Contrôle des interactions" />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="security">
                  <AccordionTrigger className="px-6 py-4 text-lg font-semibold">
                     <div className="flex items-center gap-3">
                      <Lock />
                      Sécurité
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <SettingsLink title="Authentification à deux facteurs" />
                    <SettingsLink title="Appareils connectés" />
                    <SettingsLink title="Historique des connexions" />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="notifications">
                  <AccordionTrigger className="px-6 py-4 text-lg font-semibold">
                     <div className="flex items-center gap-3">
                      <Bell />
                      Notifications
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                     <SettingsItem
                      icon={<Bell className="h-5 w-5"/>}
                      title="Tout mettre en pause"
                      action={<Switch id="pause-notifications" />}
                    />
                    <SettingsLink title="Notifications générales (Posts, Commentaires...)" />
                    <SettingsLink title="Notifications de Messages" />
                    <SettingsLink title="Notifications de Logement" />
                    <SettingsLink title="Notifications de Covoiturage" />
                  </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="content">
                  <AccordionTrigger className="px-6 py-4 text-lg font-semibold">
                     <div className="flex items-center gap-3">
                      <Palette />
                      Préférences de contenu
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <SettingsLink title="Préférences du fil" />
                    <SettingsLink title="Préférences de la page Découvrir" />
                     <SettingsItem
                      icon={<Film className="h-5 w-5"/>}
                      title="Lecture automatique des Reels"
                      action={<Switch id="reels-autoplay" defaultChecked />}
                    />
                    <SettingsItem
                      icon={<Film className="h-5 w-5"/>}
                      title="Son des Reels par défaut"
                      action={<Switch id="reels-sound" />}
                    />
                    <SettingsLink title="Mots masqués" />
                  </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="help">
                  <AccordionTrigger className="px-6 py-4 text-lg font-semibold">
                     <div className="flex items-center gap-3">
                      <HelpCircle />
                      Aide et support
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <SettingsLink title="Centre d’aide" href="/help"/>
                    <SettingsLink title="Déclarer un problème" />
                    <SettingsLink title="Règles de la communauté" />
                  </AccordionContent>
                </AccordionItem>

                 <AccordionItem value="about">
                  <AccordionTrigger className="px-6 py-4 text-lg font-semibold">
                     <div className="flex items-center gap-3">
                      <Info />
                      À propos
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <SettingsLink title="Version de l’application" />
                    <SettingsLink title="Conditions d'utilisation" href="/terms" />
                    <SettingsLink title="Politique de Confidentialité" href="/privacy" />
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
