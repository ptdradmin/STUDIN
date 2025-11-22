
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Star, LayoutGrid, Map, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Tutor, PlaceholderData } from "@/lib/types";
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-muted animate-pulse rounded-lg" />,
});


export default function TutoringPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    setIsLoading(true);
    // In a real app, you'd fetch this from your backend.
    // For now, we load it from the JSON file.
    fetch('/placeholder-data.json')
      .then(res => res.json())
      .then((data: PlaceholderData) => {
        setTutors(data.tutors);
        setIsLoading(false);
      });
  }, []);

  const renderList = () => {
     if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
             <Card key={i} className="flex flex-col text-center items-center p-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex flex-col flex-grow mt-4 w-full space-y-2">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-20 mx-auto" />
                    <div className="pt-4 mt-auto space-y-2">
                      <Skeleton className="h-8 w-1/2 mx-auto" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                </div>
             </Card>
          ))}
        </div>
      );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map(tutor => (
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
                    {user && <Button className="w-full mt-4">Contacter</Button>}
                  </Card>
            ))}
        </div>
    );
  }

  const renderMap = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-2">
            <Skeleton className="h-[600px] w-full rounded-md" />
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <CardContent className="p-2">
          <div className="h-[600px] w-full rounded-md overflow-hidden">
              <MapView items={tutors} itemType="tutor" />
          </div>
        </CardContent>
      </Card>
    );
  }

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
                <div className="flex justify-between items-center mb-4 gap-4">
                  <h2 className="text-2xl font-bold tracking-tight">Tuteurs disponibles</h2>
                  <div className="flex items-center gap-2">
                    {user && (
                      <Button>
                        <Plus className="mr-2 h-4 w-4" /> Devenir tuteur
                      </Button>
                    )}
                    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                      <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="px-3"
                      >
                        <LayoutGrid className="h-5 w-5" />
                      </Button>
                      <Button
                        variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('map')}
                        className="px-3"
                      >
                        <Map className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
                {viewMode === 'list' ? renderList() : renderMap()}
              </div>
          </div>
        </main>
        <Footer />
    </div>
  );
}
