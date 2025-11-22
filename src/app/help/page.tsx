
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { LifeBuoy, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
                    <Card className="flex flex-col">
                        <CardHeader className="items-center text-center">
                            <div className="p-3 rounded-full bg-primary/10">
                                <LifeBuoy className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>FAQ</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center flex-grow flex flex-col justify-between">
                            <p className="text-muted-foreground mb-4">Trouvez des réponses aux questions fréquemment posées.</p>
                            <Button asChild>
                                <Link href="/faq">Consulter la FAQ</Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col">
                        <CardHeader className="items-center text-center">
                           <div className="p-3 rounded-full bg-primary/10">
                                <Mail className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Email</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center flex-grow flex flex-col justify-between">
                             <p className="text-muted-foreground mb-4">Envoyez-nous directement un e-mail pour une assistance personnalisée.</p>
                             <Button asChild>
                                <Link href="mailto:support@studin.app">support@studin.app</Link>
                             </Button>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col">
                        <CardHeader className="items-center text-center">
                           <div className="p-3 rounded-full bg-primary/10">
                                <MessageSquare className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle>Ticket de Support</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center flex-grow flex flex-col justify-between">
                             <p className="text-muted-foreground mb-4">Ouvrez un ticket de support et notre équipe vous répondra rapidement.</p>
                              <Button asChild>
                                <Link href="mailto:support@studin.app?subject=Demande%20de%20Support%20STUD'IN">Ouvrir un ticket</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
        <Footer />
    </div>
  );
}
