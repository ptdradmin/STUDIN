
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TutoringPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
              <div className="container mx-auto px-4 py-12 text-center">
                  <h1 className="text-4xl font-bold">📚 Tutorat</h1>
                  <p className="mt-2 text-lg opacity-90">Trouvez de l'aide ou proposez vos services</p>
              </div>
          </div>
          <div className="container mx-auto px-4 py-8">
              <Card>
                <CardHeader>
                  <CardTitle>Trouver un tuteur</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                          <Label htmlFor="subject">Matière</Label>
                          <Input id="subject" placeholder="Ex: Mathématiques, Droit..." />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="level">Niveau</Label>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="Tous niveaux" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous niveaux</SelectItem>
                                <SelectItem value="b1">Bachelier 1</SelectItem>
                                <SelectItem value="b2">Bachelier 2</SelectItem>
                                <SelectItem value="b3">Bachelier 3</SelectItem>
                                <SelectItem value="m1">Master 1</SelectItem>
                                <SelectItem value="m2">Master 2</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                      <div className="lg:col-span-2">
                          <Button type="submit" className="w-full">Rechercher un tuteur</Button>
                      </div>
                  </form>
                </CardContent>
              </Card>

               <div className="mt-8">
                <h2 className="text-2xl font-bold tracking-tight mb-4">Tuteurs disponibles</h2>
                 <Card className="text-center py-20 bg-muted/40 border-dashed">
                  <CardContent>
                      <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mt-4">Aucun tuteur trouvé</h3>
                      <p className="text-muted-foreground mt-2">Ajustez vos critères pour trouver le tuteur idéal.</p>
                  </CardContent>
              </Card>
              </div>

          </div>
        </main>
        <Footer />
    </div>
  );
}
