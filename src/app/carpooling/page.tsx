
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Car, MapPin } from "lucide-react";

export default function CarpoolingPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-4xl font-bold">🚗 Covoiturage</h1>
                  <p className="mt-2 text-lg opacity-90">Partagez vos trajets et économisez</p>
              </div>
          </div>
          <div className="container mx-auto px-4 py-8">
              <Card>
                <CardHeader>
                  <CardTitle>Trouver un trajet</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                      <div className="space-y-2">
                          <Label htmlFor="departure">Lieu de départ</Label>
                          <Input id="departure" placeholder="Ex: Bruxelles" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="arrival">Lieu d'arrivée</Label>
                          <Input id="arrival" placeholder="Ex: Namur" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input id="date" type="date" />
                      </div>
                       <div className="space-y-2 lg:col-span-2">
                           <Button type="submit" className="w-full">Rechercher un covoiturage</Button>
                      </div>
                  </form>
                </CardContent>
              </Card>

              <div className="mt-8">
                <h2 className="text-2xl font-bold tracking-tight mb-4">Résultats de recherche</h2>
                 <Card className="text-center py-20 bg-muted/40 border-dashed">
                  <CardContent>
                      <Car className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mt-4">Aucun trajet trouvé</h3>
                      <p className="text-muted-foreground mt-2">Essayez d'ajuster vos filtres de recherche.</p>
                  </CardContent>
              </Card>
              </div>
          </div>
        </main>
        <Footer />
    </div>
  );
}
