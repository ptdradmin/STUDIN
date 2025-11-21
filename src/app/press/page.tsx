import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PressPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-bold">Espace Presse</h1>
                    <p className="text-lg mt-2 opacity-90">Informations sur les nouveautés et futures mises à jour.</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <Card className="text-center py-20">
                    <CardContent>
                        <h3 className="text-2xl font-semibold">Page en construction</h3>
                        <p className="text-muted-foreground mt-2">Cette section contiendra bientôt les informations pour la presse.</p>
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
