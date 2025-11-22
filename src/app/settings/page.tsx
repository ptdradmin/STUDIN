
'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import {
  Bell,
  ChevronRight,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Palette,
  Shield,
  Trash2,
  User,
  Film,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SettingsItem = ({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-4">
      {icon && <div className="text-muted-foreground">{icon}</div>}
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
}) => {
  const content = (
    <div className={`flex items-center justify-between py-4 -mx-6 px-6 rounded-md hover:bg-muted/50 cursor-pointer`}>
        <p className="font-medium">{title}</p>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  );

  return (
    <Link href={href} className="block">
       {content}
    </Link>
  );
};


export default function SettingsPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();

  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [pauseAllNotifications, setPauseAllNotifications] = useState(false);

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

  const handleClearHistory = () => {
    toast({
      title: "Historique effacé",
      description: "Votre historique de recherche a été supprimé.",
    });
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
                      action={<Switch id="private-profile" checked={isPrivateProfile} onCheckedChange={setIsPrivateProfile} />}
                    />
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <div className="flex items-center justify-between py-3 w-full cursor-pointer hover:bg-muted/50 -mx-6 px-6 rounded-md">
                            <div className="flex items-center gap-4">
                              <div className="text-muted-foreground"><Trash2 className="h-5 w-5"/></div>
                              <div>
                                <p className="font-medium">Effacer l'historique de recherche</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">Effacer</Button>
                          </div>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible et supprimera définitivement votre historique de recherche.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleClearHistory}>Continuer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
                      action={<Switch id="pause-notifications" checked={pauseAllNotifications} onCheckedChange={setPauseAllNotifications} />}
                    />
                    <SettingsLink title="Notifications générales (Posts, Commentaires...)" />
                    <SettingsLink title="Notifications de Messages" />
                    <SettingsLink title="Notifications de Logement" />
                    <SettingsLink title="Notifications de Covoiturage" />
                  </AccordionContent>
                </AccordionItem>
                
                 <AccordionItem value="language">
                  <AccordionTrigger className="px-6 py-4 text-lg font-semibold">
                     <div className="flex items-center gap-3">
                      <Globe />
                      Langue
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 space-y-2">
                     <Button
                        variant={language === 'fr' ? 'secondary' : 'ghost'}
                        onClick={() => setLanguage('fr')}
                        className="w-full justify-start"
                      >
                        🇫🇷 Français
                      </Button>
                      <Button
                        variant={language === 'en' ? 'secondary' : 'ghost'}
                        onClick={() => setLanguage('en')}
                        className="w-full justify-start"
                      >
                        🇬🇧 English
                      </Button>
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
                    <SettingsLink title="Lecture automatique des Reels" />
                    <SettingsLink title="Son des Reels par défaut" />
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
                    <SettingsLink title="Déclarer un problème" href="/contact" />
                    <SettingsLink title="Règles de la communauté" href="/community-rules"/>
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
                    <SettingsItem title="Version de l’application" action={<span className="text-sm text-muted-foreground">0.1.0</span>} />
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
