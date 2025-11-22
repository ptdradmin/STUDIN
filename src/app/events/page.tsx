
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EventsPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-4xl font-bold">🎉 Événements</h1>
                  <p className="mt-2 text-lg opacity-90">Ne manquez aucune activité étudiante</p>
              </div>
          </div>
          <div className="container mx-auto px-4 py-8">
              <Card>
                  <CardHeader>
                      <CardTitle>Filtrer les événements</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                          <div className="space-y-2">
                              <Label htmlFor="city">Ville</Label>
                              <Input id="city" placeholder="Ex: Louvain-la-Neuve" />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="university">Université</Label>
                               <Select>
                                  <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="all">Toutes</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="category">Catégorie</Label>
                              <Select>
                                  <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="all">Toutes</SelectItem>
                                      <SelectItem value="party">Soirée</SelectItem>
                                      <SelectItem value="conference">Conférence</SelectItem>
                                      <SelectItem value="culture">Culture</SelectItem>
                                      <SelectItem value="sport">Sport</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <div className="lg:col-span-2">
                            <Button type="submit" className="w-full">Filtrer</Button>
                          </div>
                      </form>
                  </CardContent>
              </Card>

              <div className="mt-8">
                <h2 className="text-2xl font-bold tracking-tight mb-4">Événements à venir</h2>
                 <Card className="text-center py-20 bg-muted/40 border-dashed">
                  <CardContent>
                      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mt-4">Aucun événement à venir</h3>
                      <p className="text-muted-foreground mt-2">Revenez bientôt ou élargissez votre recherche pour découvrir les activités.</p>
                  </CardContent>
              </Card>
              </div>
          </div>
        </main>
        <Footer />
    </div>
  );
}
