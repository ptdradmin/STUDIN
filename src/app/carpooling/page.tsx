

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Users } from "lucide-react";
import Image from "next/image";
import { getTrips, Trip } from "@/lib/mock-data";


export default async function CarpoolingPage() {
  const mockTrips: Trip[] = await getTrips();
  
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
                <h2 className="text-2xl font-bold tracking-tight mb-4">Trajets disponibles</h2>
                 <div className="space-y-4">
                    {mockTrips.map(trip => (
                        <Card key={trip.id} className="transition-shadow hover:shadow-md">
                            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <Image src={trip.avatar} alt={trip.driver} width={48} height={48} className="rounded-full" />
                                    <p className="font-semibold sm:hidden">{trip.driver}</p>
                                </div>
                                <div className="hidden sm:flex flex-col items-center">
                                    <p className="font-semibold">{trip.driver}</p>
                                    <p className="text-xs text-muted-foreground">⭐ 4.9</p>
                                </div>
                                <div className="flex-grow grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary"/>
                                        <div>
                                            <p className="font-medium text-sm text-muted-foreground">Départ</p>
                                            <p className="font-semibold">{trip.departure}</p>
                                        </div>
                                    </div>
                                     <div className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-secondary"/>
                                        <div>
                                            <p className="font-medium text-sm text-muted-foreground">Arrivée</p>
                                            <p className="font-semibold">{trip.arrival}</p>
                                        </div>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1 flex justify-between sm:justify-end items-center gap-4">
                                        <div className="text-center">
                                            <p className="font-medium text-sm text-muted-foreground">{trip.date}</p>
                                            <p className="font-semibold">{trip.time}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                          <Users className="h-4 w-4" />
                                          <span className="font-medium text-sm">{trip.seats}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-2 border-l pl-4 ml-4">
                                    <p className="text-xl font-bold">{trip.price}</p>
                                    <Button size="sm">Réserver</Button>
                                </div>

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
