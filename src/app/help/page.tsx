
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LifeBuoy, BookOpen, MessageSquare } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function HelpPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl text-foreground">Centre d'Aide</h1>
                <p className="mt-2 text-lg text-muted-foreground">Comment pouvons-nous vous aider ?</p>
            </div>
        </div>
        <div className="container mx-auto px-4 py-8 md:py-16">
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <Link href="/faq" className="block h-full">
                    <Card className="h-full hover:shadow-lg transition-shadow text-center">
                        <CardHeader>
                            <div className="flex justify-center mb-4">
                                 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <BookOpen className="h-8 w-8" />
                                </div>
                            </div>
                            <CardTitle>FAQ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Trouvez rapidement les réponses à vos questions les plus fréquentes.</CardDescription>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/contact" className="block h-full">
                    <Card className="h-full hover:shadow-lg transition-shadow text-center">
                         <CardHeader>
                            <div className="flex justify-center mb-4">
                                 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <LifeBuoy className="h-8 w-8" />
                                </div>
                            </div>
                            <CardTitle>Contacter le Support</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>Notre équipe est là pour vous aider avec tout problème technique ou question.</CardDescription>
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/community-rules" className="block h-full">
                     <Card className="h-full hover:shadow-lg transition-shadow lg:col-span-1 md:col-span-2 text-center">
                           <CardHeader>
                                <div className="flex justify-center mb-4">
                                     <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <MessageSquare className="h-8 w-8" />
                                    </div>
                                </div>
                                <CardTitle>Règles de la communauté</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>Consultez les règles pour un environnement sûr et respectueux.</CardDescription>
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
