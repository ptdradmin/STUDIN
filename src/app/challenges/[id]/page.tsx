
'use client';

import { useParams, useRouter } from 'next/navigation';
import SocialSidebar from '@/components/social-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Search, Trophy, UploadCloud, Loader2 } from 'lucide-react';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import type { Challenge } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';


// Simulating the static data fetch
const staticChallenges: Challenge[] = [
  {
    id: '1',
    title: "Le Lion de Waterloo",
    description: "Prenez un selfie au pied de la Butte du Lion. Assurez-vous que le monument soit bien visible derrière vous. Bonus si vous imitez la posture du lion !",
    category: 'Exploration',
    difficulty: 'facile',
    points: 10,
    imageUrl: "https://images.unsplash.com/photo-1620202271383-34445b73650c?q=80&w=2070&auto=format&fit=crop",
    location: 'Waterloo',
    latitude: 50.678,
    longitude: 4.405,
    createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '2',
    title: "Street Art à Bruxelles",
    description: "Trouvez et photographiez la fresque de Tintin et du Capitaine Haddock dans le centre-ville. La photo doit inclure un objet jaune pour prouver que vous y étiez récemment.",
    category: 'Créatif',
    difficulty: 'moyen',
    points: 25,
    imageUrl: 'https://images.unsplash.com/photo-1599709835737-27b6b15a7e6b?q=80&w=1974&auto=format&fit=crop',
    location: 'Bruxelles',
    latitude: 50.846,
    longitude: 4.352,
     createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '3',
    title: "Vue panoramique de Namur",
    description: "Montez au sommet de la Citadelle et capturez la vue sur la Meuse et la Sambre. Le défi doit être réalisé au coucher du soleil pour un maximum de points.",
    category: 'Exploration',
    difficulty: 'moyen',
    points: 20,
    imageUrl: 'https://images.unsplash.com/photo-1620766385807-617a943a8b20?q=80&w=2070&auto=format&fit=crop',
    location: 'Namur',
    latitude: 50.459,
    longitude: 4.863,
     createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '4',
    title: "Participer à une Cantus",
    description: "Immortialisez l'ambiance d'une cantus étudiante (avec respect et consentement !). Votre photo doit montrer votre codex ou votre verre.",
    category: 'Social',
    difficulty: 'facile',
    points: 15,
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop',
     createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
];


export default function ChallengeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const challengeId = params.id as string;
    
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const challenge = staticChallenges.find(c => c.id === challengeId);

    const difficultyMap: {[key: string]: {text: string, color: string}} = {
      facile: { text: "Facile", color: "bg-green-500" },
      moyen: { text: "Moyen", color: "bg-yellow-500" },
      difficile: { text: "Difficile", color: "bg-red-500" },
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProofSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofFile) {
            toast({ title: "Aucune preuve sélectionnée", description: "Veuillez choisir une photo.", variant: "destructive"});
            return;
        }
        setIsSubmitting(true);
        toast({ title: "Envoi en cours...", description: "Votre participation est en cours de validation."});

        // Simulate upload
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 95) {
                    return prev;
                }
                return prev + 10;
            });
        }, 200);

        setTimeout(() => {
            clearInterval(interval);
            setUploadProgress(100);
            setTimeout(() => {
                setIsSubmitting(false);
                setIsSubmitted(true);
                toast({ title: "Participation envoyée !", description: "Votre preuve a été soumise pour examen."});
            }, 500);
        }, 2500);
    }

    if (!challenge) {
        return (
            <div className="flex min-h-screen w-full bg-background">
                <SocialSidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p>Défi non trouvé.</p>
                     <Button onClick={() => router.push('/challenges')} className="mt-4">Retour aux défis</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex flex-col flex-1">
                 <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <Button variant="ghost" onClick={() => router.push('/challenges')} className="flex items-center gap-2">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Retour aux défis</span>
                    </Button>
                    <div className="hidden md:flex flex-1 max-w-md items-center">
                        <GlobalSearch />
                    </div>
                    <div className="flex-1 md:hidden text-center font-bold">
                        {challenge.title}
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationsDropdown />
                    </div>
                </header>

                 <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-6">
                            <Image src={challenge.imageUrl} alt={challenge.title} fill className="object-cover"/>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <h1 className="text-3xl font-bold tracking-tight">{challenge.title}</h1>
                                <p className="text-muted-foreground mt-4">{challenge.description}</p>
                            </div>
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Détails du Défi</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Points</span>
                                            <span className="font-bold flex items-center gap-1"><Trophy className="h-4 w-4 text-yellow-500" /> {challenge.points}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Difficulté</span>
                                            <Badge variant="outline" className="capitalize flex items-center gap-2">
                                                 <div className={`w-2 h-2 rounded-full ${difficultyMap[challenge.difficulty]?.color}`}></div>
                                                {difficultyMap[challenge.difficulty]?.text}
                                            </Badge>
                                        </div>
                                         <div className="flex justify-between">
                                            <span className="text-muted-foreground">Catégorie</span>
                                            <Badge variant="secondary">{challenge.category}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Soumettre votre preuve</CardTitle>
                                        <CardDescription>Téléchargez une photo pour valider le défi.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                      {isSubmitted ? (
                                        <div className="text-center p-4 bg-green-50 rounded-md border border-green-200">
                                            <Check className="h-10 w-10 text-green-600 mx-auto mb-2" />
                                            <h4 className="font-semibold text-green-800">Participation envoyée !</h4>
                                            <p className="text-sm text-green-700">Votre preuve est en cours de validation.</p>
                                        </div>
                                      ) : (
                                        <form onSubmit={handleProofSubmit} className="space-y-4">
                                            {previewUrl && (
                                                <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                                    <Image src={previewUrl} alt="Aperçu de la preuve" layout="fill" objectFit="cover" />
                                                </div>
                                            )}
                                            <div>
                                                <Label htmlFor="proof-file" className="sr-only">Fichier de preuve</Label>
                                                <Input id="proof-file" type="file" accept="image/*" onChange={handleFileChange} disabled={isSubmitting} />
                                            </div>

                                            {isSubmitting && <Progress value={uploadProgress} className="w-full h-2" />}

                                            <Button className="w-full" type="submit" disabled={isSubmitting || !proofFile}>
                                                {isSubmitting ? (
                                                  <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Envoi...
                                                  </>
                                                ) : (
                                                  <>
                                                    <UploadCloud className="mr-2 h-4 w-4" />
                                                    Valider ma participation
                                                  </>
                                                )}
                                            </Button>
                                        </form>
                                      )}
                                    </CardContent>
                                </Card>

                            </div>
                        </div>
                    </div>
                 </main>
            </div>
        </div>
    )
}
