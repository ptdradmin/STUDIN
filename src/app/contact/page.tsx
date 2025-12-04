
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-foreground">Contactez-nous</h1>
                <p className="mt-2 text-lg text-muted-foreground">Un problème, une question ? Nous sommes là pour vous aider.</p>
            </div>
        </div>
        <div className="container mx-auto px-4 py-8 md:py-16">
             <Card className="max-w-4xl mx-auto shadow-lg">
                <CardContent className="p-8">
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <CardHeader className="p-0">
                            <CardTitle className="text-2xl">Nos Coordonnées</CardTitle>
                        </CardHeader>
                        <div className="space-y-4 text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary" />
                                <span>contact@stud-in.com</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-primary" />
                                <span>Namur, Belgique</span>
                            </div>
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
