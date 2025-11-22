
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { getEvents, Event } from "@/lib/mock-data";


export default async function EventsPage() {
  const mockEvents: Event[] = await getEvents();

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
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockEvents.map(event => (
                        <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-xl flex flex-col">
                            <div className="relative">
                                <Image src={event.imageUrl} alt={event.title} width={600} height={400} className="aspect-video w-full object-cover" data-ai-hint={event.imageHint} />
                                <Badge className="absolute top-2 right-2">{event.category}</Badge>
                            </div>
                            <CardContent className="p-4 flex flex-col flex-grow">
                                <p className="font-semibold text-primary">{event.date}</p>
                                <h3 className="text-lg font-bold mt-1 flex-grow">{event.title}</h3>
                                <p className="text-sm text-muted-foreground flex items-center mt-2">
                                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                    {event.location}
                                </p>
                                <Button className="w-full mt-4">Voir les détails</Button>
                            </CardContent>
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
