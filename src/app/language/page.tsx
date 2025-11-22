
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LanguagePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold">Langue / Language</h1>
            <p className="mt-2 text-lg opacity-90">Choisissez votre langue de préférence.</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-6 w-6" />
                Sélection de la langue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-between" variant="secondary">
                <span>🇫🇷 FR</span>
                <span className="text-xs text-muted-foreground">Actif</span>
              </Button>
              <Button className="w-full justify-between" variant="outline" disabled>
                <span>🇬🇧 EN</span>
                 <span className="text-xs text-muted-foreground">Bientôt</span>
              </Button>
               <p className="text-sm text-center text-muted-foreground pt-4">La prise en charge multilingue est en cours de développement.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
