
'use client';

import { useParams, useRouter } from 'next/navigation';
import SocialSidebar from '@/components/social-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Check, Trophy, UploadCloud, Loader2, MapPin, Play, UserCheck, X } from 'lucide-react';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import type { Challenge, ChallengeSubmission, UserProfile } from '@/lib/types';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});


const staticChallenges: Challenge[] = [
  {
    id: '1',
    creatorId: 'partner-account-id', // Make this a predictable ID for demo purposes
    title: "Le Lion de Waterloo",
    description: "Prenez un selfie au pied de la Butte du Lion. Assurez-vous que le monument soit bien visible derrière vous. Bonus si vous imitez la posture du lion !",
    category: 'Exploration',
    difficulty: 'facile',
    points: 10,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-1')?.imageUrl || '',
    location: 'Waterloo',
    latitude: 50.678,
    longitude: 4.405,
    createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '2',
    creatorId: 'admin-user',
    title: "Street Art à Bruxelles",
    description: "Trouvez et photographiez la fresque de Tintin et du Capitaine Haddock dans le centre-ville. La photo doit inclure un objet jaune pour prouver que vous y étiez récemment.",
    category: 'Créatif',
    difficulty: 'moyen',
    points: 25,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-2')?.imageUrl || '',
    location: 'Bruxelles',
    latitude: 50.846,
    longitude: 4.352,
     createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '3',
    creatorId: 'admin-user',
    title: "Vue panoramique de Namur",
    description: "Montez au sommet de la Citadelle et capturez la vue sur la Meuse et la Sambre. Le défi doit être réalisé au coucher du soleil pour un maximum de points.",
    category: 'Exploration',
    difficulty: 'moyen',
    points: 20,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-3')?.imageUrl || '',
    location: 'Namur',
    latitude: 50.459,
    longitude: 4.863,
     createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '4',
    creatorId: 'admin-user',
    title: "Participer à une Cantus",
    description: "Immortialisez l'ambiance d'une cantus étudiante (avec respect et consentement !). Votre photo doit montrer votre codex ou votre verre.",
    category: 'Social',
    difficulty: 'facile',
    points: 15,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-4')?.imageUrl || '',
     createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
  {
    id: '5',
    creatorId: 'partner-account-id',
    title: "L'énigme du Manneken-Pis",
    description: "Le plus célèbre ket de Bruxelles a un secret. Chaque jeudi, un indice est révélé dans sa garde-robe. Trouvez l'indice de cette semaine et décryptez-le. Soumettez la réponse comme preuve.",
    category: 'Créatif',
    difficulty: 'difficile',
    points: 50,
    imageUrl: PlaceHolderImages.find(p => p.id === 'challenge-5')?.imageUrl || '',
    location: 'Bruxelles', // On peut donner la ville sans les coordonnées précises
    createdAt: { seconds: 1672531200, nanoseconds: 0 } as any,
  },
];


const staticSubmissions: (ChallengeSubmission & { id: string })[] = [
    { id: 'sub1', challengeId: '1', userId: 'user1', proofUrl: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?q=80&w=1974&auto=format&fit=crop', status: 'pending', createdAt: { seconds: 1672620000, nanoseconds: 0 } as any, userProfile: { username: 'Alice', avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=alice' } },
    { id: 'sub2', challengeId: '1', userId: 'user2', proofUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1974&auto=format&fit=crop', status: 'pending', createdAt: { seconds: 1672621000, nanoseconds: 0 } as any, userProfile: { username: 'Bob', avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=bob' } },
    { id: 'sub3', challengeId: '5', userId: 'user3', proofUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop', status: 'pending', createdAt: { seconds: 1672622000, nanoseconds: 0 } as any, userProfile: { username: 'Charlie', avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=charlie' } },
];


export default function ChallengeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const challengeId = params.id as string;
    
    const [isParticipating, setIsParticipating] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submissions, setSubmissions] = useState(staticSubmissions.filter(s => s.challengeId === challengeId));

    const challenge = staticChallenges.find(c => c.id === challengeId);
    
    // This is a placeholder. In a real app, you'd fetch the user's role.
    const isChallengeCreator = user?.uid === challenge?.creatorId;

    const handleSubmissionAction = (submissionId: string, action: 'approve' | 'reject') => {
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
        toast({
            title: `Participation ${action === 'approve' ? 'approuvée' : 'rejetée'}`,
            description: `Les points de l'utilisateur ont été mis à jour.`,
        });
        // In a real app, you'd update the submission status and user points in Firestore.
    };

    const imageHint = PlaceHolderImages.find(p => p.imageUrl === challenge?.imageUrl)?.imageHint || 'student challenge';

    const difficultyMap: {[key: string]: {text: string, color: string}} = {
      facile: { text: "Facile", color: "bg-green-500" },
      moyen: { text: "Moyen", color: "bg-yellow-500" },
      difficile: { text: "Difficile", color: "bg-red-500" },
    };

    const handleParticipate = () => {
        if (!user) {
            router.push(`/login?from=/challenges/${challengeId}`);
            return;
        }
        setIsParticipating(true);
        toast({
            title: "Participation enregistrée !",
            description: "Vous pouvez maintenant soumettre votre preuve.",
        });
    }
    
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
    
    const hasLocation = challenge.latitude && challenge.longitude;

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex flex-col flex-1">
                 <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <Button variant="ghost" onClick={() => router.push('/challenges')} className="flex items-center gap-2">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="hidden sm:inline">Retour aux défis</span>
                    </Button>
                    <div className="flex-1 max-w-md">
                        <GlobalSearch />
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationsDropdown />
                    </div>
                </header>

                 <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-4xl mx-auto">
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                 <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-6">
                                    <Image src={challenge.imageUrl} alt={challenge.title} fill className="object-cover" data-ai-hint={imageHint} />
                                </div>
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
                                        {challenge.location && (
                                          <div className="flex justify-between pt-2 border-t">
                                              <span className="text-muted-foreground">Lieu</span>
                                              <span className="font-semibold flex items-center gap-1"><MapPin className="h-4 w-4" /> {challenge.location}</span>
                                          </div>
                                        )}
                                    </CardContent>
                                </Card>
                                
                                {hasLocation && (
                                   <Card>
                                      <CardHeader>
                                        <CardTitle className="text-base">Emplacement du Défi</CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-0">
                                         <div className="h-64 w-full">
                                            <MapView items={[challenge]} itemType="challenge" selectedItem={challenge} />
                                         </div>
                                      </CardContent>
                                    </Card>
                                )}

                                <Card>
                                    {!isParticipating && !isChallengeCreator ? (
                                        <CardContent className="p-6 text-center">
                                            <h3 className="font-bold">Prêt à relever le défi ?</h3>
                                            <p className="text-sm text-muted-foreground mt-2 mb-4">Cliquez sur participer pour commencer et débloquer la soumission de preuve.</p>
                                            <Button className="w-full" onClick={handleParticipate}>
                                                <Play className="mr-2 h-4 w-4" /> Participer au défi
                                            </Button>
                                        </CardContent>
                                    ) : !isChallengeCreator && (
                                        <>
                                            <CardHeader>
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <UserCheck className="h-5 w-5 text-green-600" />
                                                    Vous participez !
                                                </CardTitle>
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
                                        </>
                                    )}
                                </Card>
                            </div>
                        </div>

                        {isChallengeCreator && (
                            <div className="mt-10">
                                <h2 className="text-2xl font-bold tracking-tight mb-4">Soumissions en attente ({submissions.length})</h2>
                                <div className="space-y-4">
                                {submissions.length > 0 ? submissions.map(sub => (
                                    <Card key={sub.id}>
                                        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start">
                                            <div className="relative w-full md:w-48 h-48 flex-shrink-0 rounded-md overflow-hidden">
                                                <Image src={sub.proofUrl} alt={`Preuve de ${sub.userProfile.username}`} layout="fill" objectFit="cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={sub.userProfile.avatarUrl} />
                                                        <AvatarFallback>{sub.userProfile.username.substring(0,2)}</AvatarFallback>
                                                    </Avatar>
                                                    <p className="font-semibold">{sub.userProfile.username}</p>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">Soumis il y a quelques instants</p>
                                            </div>
                                            <div className="flex gap-2 self-start md:self-center flex-shrink-0">
                                                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleSubmissionAction(sub.id, 'reject')}>
                                                    <X className="mr-2 h-4 w-4" /> Rejeter
                                                </Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleSubmissionAction(sub.id, 'approve')}>
                                                    <Check className="mr-2 h-4 w-4" /> Approuver
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <Card>
                                        <CardContent className="p-8 text-center text-muted-foreground">
                                            Aucune nouvelle participation à valider pour ce défi.
                                        </CardContent>
                                    </Card>
                                )}
                                </div>
                            </div>
                        )}
                    </div>
                 </main>
            </div>
        </div>
    )
}
