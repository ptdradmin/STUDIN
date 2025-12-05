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
import { useState, useMemo, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useMemoFirebase, useDoc, useCollection, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc, collection, query, where, serverTimestamp, runTransaction, increment, getDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useStorage } from '@/firebase/provider';
import { staticChallenges } from '@/lib/static-data';
import { verifySubmission } from '@/ai/flows/verify-submission-flow';

const MapView = dynamic(() => import('@/components/map-view'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default function ChallengeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const storage = useStorage();
    const challengeId = params.id as string;
    
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [isChallengeLoading, setIsChallengeLoading] = useState(true);
    
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    
    useEffect(() => {
        setIsChallengeLoading(true);
        const foundChallenge = staticChallenges.find(c => c.id === challengeId);
        setChallenge(foundChallenge || null);
        setIsChallengeLoading(false);
    }, [challengeId]);

    const submissionsQuery = useMemoFirebase(() => !firestore || !challengeId ? null : query(collection(firestore, 'challenges', challengeId, 'submissions')), [firestore, challengeId]);
    const { data: submissions, isLoading: areSubmissionsLoading } = useCollection<ChallengeSubmission>(submissionsQuery);

    const userSubmission = useMemo(() => submissions?.find(s => s.userId === user?.uid), [submissions, user]);

    const userProfileRef = useMemoFirebase(() => !user || !firestore ? null : doc(firestore, 'users', user.uid), [user, firestore]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const isChallengeCreator = user?.uid === challenge?.creatorId;

    const handleSubmissionAction = async (submission: ChallengeSubmission, action: 'approve' | 'reject') => {
        if (!firestore || !challenge) return;
        const submissionRef = doc(firestore, 'challenges', challenge.id, 'submissions', submission.id);
        const userRef = doc(firestore, 'users', submission.userId);

        updateDocumentNonBlocking(submissionRef, { status: action });
        toast({
            title: `Participation ${action === 'approve' ? 'approuvée' : 'rejetée'}`,
            description: action === 'approve' ? `Les points ont été ajoutés à ${submission.userProfile.username}.` : undefined,
        });

        if (action === 'approve') {
             try {
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                     updateDocumentNonBlocking(userRef, { 
                        points: increment(challenge.points),
                        challengesCompleted: increment(1)
                    });
                }
            } catch(e) {
                console.error("Failed to update user points for challenge:", e);
                 // The UI has already updated, so we just log the error here.
                 // A more robust system would use Cloud Functions for this.
            }
        }
    };

    const imageHint = challenge?.imageUrl || 'student challenge';

    const difficultyMap: {[key: string]: {text: string, color: string}} = {
      facile: { text: "Facile", color: "bg-green-500" },
      moyen: { text: "Moyen", color: "bg-yellow-500" },
      difficile: { text: "Difficile", color: "bg-red-500" },
    };

    const handleParticipate = async () => {
        if (!user || !firestore) {
            router.push(`/login?from=/challenges/${challengeId}`);
            return;
        }
        toast({ title: "Vous participez déjà !", description: "Vous pouvez maintenant soumettre votre preuve." });
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

    const handleProofSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proofFile || !user || !userProfile || !firestore || !storage || !challenge || !previewUrl) {
            toast({ title: "Erreur", description: "Vérifiez que vous êtes connecté et qu'un fichier est sélectionné.", variant: "destructive"});
            return;
        }
        setIsSubmitting(true);
        toast({ title: "Envoi en cours...", description: "Votre participation est en cours de validation."});

        const submissionRef = doc(collection(firestore, 'challenges', challenge.id, 'submissions'));
        
        try {
            const verificationResult = await verifySubmission({
                photoDataUri: previewUrl,
                challengeTitle: challenge.title,
                challengeDescription: challenge.description,
            });

            const { isVerified, reason } = verificationResult;

            const imageRef = storageRef(storage, `submissions/${challenge.id}/${user.uid}/${proofFile.name}`);
            const uploadTask = uploadBytesResumable(imageRef, proofFile);
            
             uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    throw new Error("Erreur de téléversement");
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    const submissionData = {
                        id: submissionRef.id,
                        challengeId: challenge.id,
                        userId: user.uid,
                        userProfile: {
                            username: userProfile.username,
                            avatarUrl: userProfile.profilePicture
                        },
                        proofUrl: downloadURL,
                        status: isVerified ? 'approved' : 'rejected' as 'approved' | 'rejected',
                        createdAt: serverTimestamp()
                    };

                    const userRef = doc(firestore, 'users', user.uid);
                    
                    setDocumentNonBlocking(submissionRef, submissionData, { merge: false });
                    
                    if(isVerified) {
                        updateDocumentNonBlocking(userRef, {
                             points: increment(challenge.points),
                             challengesCompleted: increment(1)
                         });
                    }

                    setUploadProgress(100);
                     setTimeout(() => {
                        setIsSubmitting(false);
                        if (isVerified) {
                            toast({ title: "Participation approuvée !", description: `Félicitations ! ${reason}` });
                        } else {
                            toast({ variant: 'destructive', title: "Participation rejetée", description: `L'IA a déterminé que la photo ne correspond pas. Raison : ${reason}` });
                        }
                    }, 500);
                }
            );

        } catch (error) {
             console.error("Error during submission process:", error);
             setIsSubmitting(false);
             toast({ title: "Erreur de soumission", description: "Une erreur est survenue lors de la validation.", variant: "destructive" });
        }
    }

    if (isChallengeLoading) {
        return (
            <div className="flex min-h-screen w-full bg-background">
                <SocialSidebar />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        )
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
    const isParticipating = !!userSubmission;

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
                                 {challenge && challenge.imageUrl && (
                                     <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-6">
                                        <Image src={challenge.imageUrl} alt={challenge.title} fill className="object-cover" data-ai-hint={imageHint} />
                                    </div>
                                 )}
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
                                
                                {hasLocation && isClient && (
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
                                    {!isParticipating && !isChallengeCreator && isClient ? (
                                        <CardContent className="p-6 text-center">
                                            <h3 className="font-bold">Prêt à relever le défi ?</h3>
                                            <p className="text-sm text-muted-foreground mt-2 mb-4">Rejoignez pour débloquer la soumission de preuve.</p>
                                            <Button className="w-full" onClick={handleParticipate}>
                                                <Play className="mr-2 h-4 w-4" /> Participer au défi
                                            </Button>
                                        </CardContent>
                                    ) : !isChallengeCreator && isClient && (
                                        <>
                                            <CardHeader>
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <UserCheck className="h-5 w-5 text-green-600" />
                                                    {userSubmission?.status === 'pending' ? "Participation en attente" : userSubmission?.status === 'approved' ? "Participation approuvée !" : "Soumettez votre preuve"}
                                                </CardTitle>
                                                <CardDescription>
                                                    {userSubmission?.status === 'pending' ? "Votre preuve est en cours de validation." : userSubmission?.status === 'approved' ? "Félicitations, les points ont été ajoutés !" : "Téléchargez une photo pour valider le défi."}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                            {isParticipating && userSubmission ? (
                                                <div className="text-center p-4 bg-muted rounded-md border">
                                                    {userSubmission?.proofUrl && <Image src={userSubmission.proofUrl} alt="Votre soumission" width={200} height={150} className="rounded-md mx-auto mb-2" />}
                                                    <p className="text-sm text-muted-foreground">Statut : <Badge variant={userSubmission.status === 'approved' ? 'default' : userSubmission.status === 'rejected' ? 'destructive' : 'secondary'}>{userSubmission.status}</Badge></p>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleProofSubmit} className="space-y-4">
                                                    {previewUrl && (
                                                        <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                                            <Image src={previewUrl} alt="Aperçu de la preuve" fill objectFit="cover" />
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
                                <h2 className="text-2xl font-bold tracking-tight mb-4">Soumissions en attente ({submissions?.filter(s=>s.status === 'pending').length || 0})</h2>
                                <div className="space-y-4">
                                {areSubmissionsLoading ? <Loader2 className="h-6 w-6 animate-spin"/> : submissions && submissions.filter(s => s.status === 'pending').length > 0 ? submissions.filter(s => s.status === 'pending').map(sub => (
                                    <Card key={sub.id}>
                                        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start">
                                            <div className="relative w-full md:w-48 h-48 flex-shrink-0 rounded-md overflow-hidden">
                                                <Image src={sub.proofUrl} alt={`Preuve de ${sub.userProfile.username}`} fill objectFit="cover" />
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
                                                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleSubmissionAction(sub, 'reject')}>
                                                    <X className="mr-2 h-4 w-4" /> Rejeter
                                                </Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleSubmissionAction(sub, 'approve')}>
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
