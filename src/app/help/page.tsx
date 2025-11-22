
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { LifeBuoy, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";

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
                 <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <div className="p-3 rounded-full bg-primary/10">
                                <LifeBuoy className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>FAQ</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground">Trouvez des réponses aux questions fréquemment posées. (Bientôt disponible)</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="items-center text-center">
                           <div className="p-3 rounded-full bg-primary/10">
                                <Mail className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Email</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                             <p className="text-muted-foreground">Envoyez-nous un e-mail à <Link href="mailto:support@studin.app" className="text-primary hover:underline">support@studin.app</Link>.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="items-center text-center">
                           <div className="p-3 rounded-full bg-primary/10">
                                <MessageSquare className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Chat</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                             <p className="text-muted-foreground">Discutez avec notre équipe de support (bientôt disponible).</p>
                        </CardContent>
                    </Card>
                </div>
                 <Card className="text-center py-10 mt-8 bg-muted/40 border-dashed">
                    <CardContent>
                        <h3 className="text-xl font-semibold">Le centre d'aide est en cours de construction.</h3>
                        <p className="text-muted-foreground mt-2">Nous travaillons à la mise en place d'une section d'aide complète avec une FAQ détaillée.</p>
                    </CardContent>
                </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
