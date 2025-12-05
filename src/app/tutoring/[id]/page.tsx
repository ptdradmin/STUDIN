
'use client';

import { useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MessageSquare, ArrowLeft } from 'lucide-react';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import type { Tutor, TutoringReview } from '@/lib/types';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import SocialSidebar from '@/components/social-sidebar';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getOrCreateConversation } from '@/lib/conversations';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CreateReviewForm from '@/components/create-review-form';
import Navbar from '@/components/navbar';

export async function generateStaticParams() {
  // This function is required for static export.
  // It returns an empty array, which means pages will be generated on-demand at client-side.
  return [];
}

function TutorPageSkeleton() {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <Skeleton className="h-8 w-24 mb-6" />
            <Card>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-[150px_1fr] gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Skeleton className="h-36 w-36 rounded-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-5 w-1/3" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                            <div className="pt-4 space-y-2">
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="mt-8">
                <Skeleton className="h-8 w-32 mb-4" />
                <Card><CardContent className="p-6 space-y-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            </div>
        </div>
    );
}

function ReviewCard({ review }: { review: TutoringReview }) {

    const getInitials = (name?: string) => {
        if (!name) return "..";
        return name.split(' ').map(n => n[0]).join('');
    }

    return (
        <div className="flex items-start gap-4">
            <Avatar>
                <AvatarImage src={review.studentAvatar} />
                <AvatarFallback>{getInitials(review.studentName)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{review.studentName}</p>
                    <span className="text-xs text-muted-foreground">{format(new Date(review.createdAt.toDate()), 'dd MMM yyyy', { locale: fr })}</span>
                </div>
                 <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
            </div>
        </div>
    )
}

export default function TutorProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const tutorId = params.id as string;
  
  const [showReviewForm, setShowReviewForm] = useState(false);

  const tutorRef = useMemoFirebase(() => {
    if (!tutorId || !firestore) return null;
    return doc(firestore, 'tutorings', tutorId);
  }, [tutorId, firestore]);
  const { data: tutor, isLoading: isTutorLoading, error: tutorError } = useDoc<Tutor>(tutorRef);

  const reviewsQuery = useMemoFirebase(() => {
    if (!tutorId || !firestore) return null;
    return query(collection(firestore, 'tutoring_reviews'), where('tutoringId', '==', tutorId), orderBy('createdAt', 'desc'));
  }, [tutorId, firestore]);
  const { data: reviews, isLoading: areReviewsLoading, error: reviewsError } = useCollection<TutoringReview>(reviewsQuery);
  
  const handleReviewSubmitted = useCallback(() => {
    // Manually refetch or update data if useCollection doesn't automatically.
    // For now, we assume onSnapshot handles it.
  }, []);

  const handleContact = async () => {
    if (isUserLoading) return;
    if (!user || !firestore || !tutor) {
        router.push(`/login?from=/tutoring/${tutorId}`);
        return;
    }
    if (user.uid === tutor.tutorId) {
        toast({ variant: 'destructive', title: 'Action impossible', description: 'Vous ne pouvez pas vous contacter vous-même.' });
        return;
    }

    const conversationId = await getOrCreateConversation(firestore, user.uid, tutor.tutorId);
    if (conversationId) {
        router.push(`/messages/${conversationId}`);
    } else {
        toast({ title: "Erreur", description: "Impossible de démarrer la conversation.", variant: "destructive" });
    }
  }
  
  const handleLeaveReview = () => {
    if (isUserLoading) return;
    if (!user) {
        router.push(`/login?from=/tutoring/${tutorId}`);
        return;
    }
    setShowReviewForm(true);
  }

  const isLoading = isTutorLoading || areReviewsLoading;
  const isOwnProfile = user?.uid === tutor?.tutorId;

  if (!isLoading && !tutor) {
      return (
          <div className="flex items-center justify-center h-screen">
              <p>Profil de tuteur introuvable.</p>
          </div>
      )
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
        {user && <SocialSidebar />}
        <div className="flex flex-col flex-1">
            {user ? (
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 max-w-md">
                        <GlobalSearch />
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationsDropdown />
                    </div>
                </header>
            ) : (
                <Navbar />
            )}
            <main className="flex-1 overflow-y-auto">
                {isLoading ? <TutorPageSkeleton /> : tutor && (
                    <div className="max-w-4xl mx-auto p-4 md:p-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="grid md:grid-cols-[150px_1fr] gap-6 md:gap-8">
                                    <div className="flex flex-col items-center text-center gap-4">
                                        <Avatar className="h-36 w-36 border-4 border-primary/20">
                                            <AvatarImage src={tutor.userAvatarUrl} />
                                            <AvatarFallback>
                                                {tutor.username?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                             <h1 className="text-2xl font-bold">{tutor.username}</h1>
                                             <p className="text-muted-foreground">{tutor.level}</p>
                                        </div>
                                       
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star className="h-5 w-5 fill-current" />
                                            <span className="font-bold text-lg text-foreground">{tutor.rating?.toFixed(1)}</span>
                                            <span className="text-sm text-muted-foreground">({tutor.totalReviews || 0} avis)</span>
                                        </div>
                                         <p className="text-3xl font-bold text-primary">{tutor.pricePerHour}€/h</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <Badge variant="secondary" className="text-lg">{tutor.subject}</Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            {tutor.locationType !== 'online' && <Badge variant="outline">En personne</Badge>}
                                            {tutor.locationType !== 'in-person' && <Badge variant="outline">En ligne</Badge>}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base mb-1">Description</h3>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{tutor.description}</p>
                                        </div>

                                        {!isOwnProfile && (
                                            <div className="flex gap-2 pt-4">
                                                <Button onClick={handleContact} className="w-full" disabled={isUserLoading}>
                                                    <MessageSquare className="mr-2 h-4 w-4" /> Contacter
                                                </Button>
                                                <Button onClick={handleLeaveReview} variant="outline" className="w-full" disabled={isUserLoading}>
                                                    <Star className="mr-2 h-4 w-4" /> Laisser un avis
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold mb-4">Avis des étudiants ({reviews?.length || 0})</h2>
                             <Card>
                                <CardContent className="p-6 space-y-6">
                                    {reviews && reviews.length > 0 ? (
                                        reviews.map(review => <ReviewCard key={review.id} review={review}/>)
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">Aucun avis pour le moment. Soyez le premier !</p>
                                    )}
                                </CardContent>
                             </Card>
                        </div>

                        {showReviewForm && (
                            <CreateReviewForm 
                                tutor={tutor} 
                                onClose={() => setShowReviewForm(false)}
                                onReviewSubmitted={handleReviewSubmitted}
                            />
                        )}
                    </div>
                )}
            </main>
        </div>
    </div>
  );
}
