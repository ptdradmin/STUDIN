import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-bold">Aide & Support</h1>
                    <p className="mt-2 text-lg opacity-90">Nous sommes là pour vous aider</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                <Card className="text-center py-20">
                    <CardContent>
                        <h3 className="text-2xl font-semibold">Page en construction</h3>
                        <p className="text-muted-foreground mt-2">La section d'aide sera bientôt disponible.</p>
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
