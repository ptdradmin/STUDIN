
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getTutors, Tutor } from "@/lib/mock-data";

export default async function TutoringPage() {
  const mockTutors: Tutor[] = await getTutors();

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
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockTutors.map(tutor => (
                         <Card key={tutor.id} className="flex flex-col text-center items-center p-6 transition-shadow hover:shadow-xl">
                            <div className="flex-shrink-0">
                              <Image src={tutor.avatar} alt={tutor.name} width={96} height={96} className="rounded-full" />
                            </div>
                            <div className="flex flex-col flex-grow mt-4">
                              <h3 className="text-xl font-bold">{tutor.name}</h3>
                              <p className="text-sm text-muted-foreground">{tutor.level} - {tutor.university}</p>
                              <Badge variant="secondary" className="mt-3 mx-auto">{tutor.subject}</Badge>
                              <div className="flex items-center justify-center gap-1 text-yellow-500 mt-3">
                                  <Star className="h-5 w-5 fill-current" />
                                  <span className="font-bold text-base text-foreground">{tutor.rating.toFixed(1)}</span>
                              </div>
                              <p className="text-2xl font-bold text-primary mt-auto pt-4">{tutor.rate}</p>
                            </div>
                            <Button className="w-full mt-4">Contacter</Button>
                         </Card>
                    ))}
                 </div>
              </div>

          </div>
        </main>
        <Footer />
    </div>
  );
}
