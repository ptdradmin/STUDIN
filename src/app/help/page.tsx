
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-bold">Contacter le support</h1>
                    <p className="mt-2 text-lg opacity-90">Un problème, une question ? Nous sommes là pour vous aider.</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                 <Card className="max-w-4xl mx-auto">
                    <CardContent className="p-8">
                      <div className="grid md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Contact</h2>
                            <div className="space-y-4 text-muted-foreground">
                                <p><strong>Email:</strong> contact@studin.online</p>
                                <p><strong>Siège social:</strong> Namur, Belgique</p>
                            </div>
                            <div className="pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Notre équipe s'efforce de répondre à toutes les demandes dans un délai de 24 à 48 heures ouvrables.
                                </p>
                            </div>
                        </div>

                        <form className="space-y-4">
                            <div>
                                <Label htmlFor="name">Votre Nom</Label>
                                <Input id="name" placeholder="John Doe" />
                            </div>
                             <div>
                                <Label htmlFor="email">Votre Email</Label>
                                <Input id="email" type="email" placeholder="john.doe@example.com" />
                            </div>
                            <div>
                                <Label htmlFor="subject">Sujet</Label>
                                <Input id="subject" placeholder="ex: Problème avec mon compte" />
                            </div>
                            <div>
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" placeholder="Décrivez votre problème en détail..." className="min-h-[120px]" />
                            </div>
                            <Button type="submit" className="w-full">
                                Envoyer le message
                            </Button>
                        </form>
                      </div>
                    </CardContent>
                 </Card>
            </div>
        </main>
        <Footer />
    </div>
  );
}
