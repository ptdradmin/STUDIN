
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { LifeBuoy, BookOpen, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
            <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h1 className="text-4xl font-bold">Centre d'Aide</h1>
                    <p className="mt-2 text-lg opacity-90">Comment pouvons-nous vous aider ?</p>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <Link href="/faq">
                        <Card className="h-full hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-center mb-4">
                                     <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <BookOpen className="h-8 w-8" />
                                    </div>
                                </div>
                                <CardTitle className="text-center">FAQ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center">Trouvez rapidement les réponses à vos questions les plus fréquentes.</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/contact">
                        <Card className="h-full hover:shadow-lg transition-shadow">
                             <CardHeader>
                                <div className="flex justify-center mb-4">
                                     <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <LifeBuoy className="h-8 w-8" />
                                    </div>
                                </div>
                                <CardTitle className="text-center">Ouvrir un ticket</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center">Notre équipe est là pour vous aider avec tout problème technique ou question.</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                     <Link href="#">
                         <Card className="h-full hover:shadow-lg transition-shadow lg:col-span-1 md:col-span-2">
                               <CardHeader>
                                    <div className="flex justify-center mb-4">
                                         <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <MessageSquare className="h-8 w-8" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-center">Chat en Direct</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-center">Discutez avec notre équipe de support.</CardDescription>
                                </CardContent>
                            </Card>
                     </Link>
                 </div>
            </div>
        </main>
        <Footer />
    </div>
  );
}
