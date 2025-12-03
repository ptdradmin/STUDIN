
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore } from '@/firebase';
import { collection, serverTimestamp, doc, runTransaction } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import { Tutor } from '@/lib/types';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

const reviewSchema = z.object({
  rating: z.number().min(1, 'La note est requise').max(5),
  comment: z.string().min(10, 'Le commentaire doit faire au moins 10 caractères.'),
});

type ReviewFormInputs = z.infer<typeof reviewSchema>;

interface CreateReviewFormProps {
  tutor: Tutor;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export default function CreateReviewForm({ tutor, onClose, onReviewSubmitted }: CreateReviewFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ReviewFormInputs>({
    resolver: zodResolver(reviewSchema),
  });

  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const currentRating = watch('rating', 0);

  const onSubmit: SubmitHandler<ReviewFormInputs> = async (data) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }
    setLoading(true);

    const reviewRef = doc(collection(firestore, 'tutoring_reviews'));
    const tutorRef = doc(firestore, 'tutorings', tutor.id);

    const reviewData = {
        id: reviewRef.id,
        tutoringId: tutor.id,
        studentId: user.uid,
        studentName: user.displayName || 'Anonyme',
        studentAvatar: user.photoURL,
        ...data,
        createdAt: serverTimestamp(),
    };

    runTransaction(firestore, async (transaction) => {
        const tutorDoc = await transaction.get(tutorRef);
        if (!tutorDoc.exists()) {
            throw "Le profil du tuteur n'existe pas !";
        }

        const oldTotalReviews = tutorDoc.data().totalReviews || 0;
        const oldAverageRating = tutorDoc.data().rating || 0;

        const newTotalReviews = oldTotalReviews + 1;
        const newAverageRating = ((oldAverageRating * oldTotalReviews) + data.rating) / newTotalReviews;

        transaction.set(reviewRef, reviewData);
        transaction.update(tutorRef, { 
            totalReviews: newTotalReviews,
            rating: newAverageRating,
        });
    }).then(() => {
        toast({ title: 'Succès', description: 'Avis publié !' });
        onReviewSubmitted();
        onClose();
    }).catch((error) => {
         const permissionError = new FirestorePermissionError({
            path: `tutoring_reviews ou tutorings/${tutor.id}`,
            operation: 'write', // 'write' covers set and update in a transaction
            requestResourceData: { review: data, tutorId: tutor.id },
        });
        errorEmitter.emit('permission-error', permissionError);
    }).finally(() => {
        setLoading(false);
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Laisser un avis pour {tutor.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label>Note</Label>
                <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`h-8 w-8 cursor-pointer transition-colors ${
                                (hoverRating || currentRating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                            onClick={() => setValue('rating', star, { shouldValidate: true })}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        />
                    ))}
                </div>
                {errors.rating && <p className="text-xs text-destructive mt-1">{errors.rating.message}</p>}
            </div>
          <div>
            <Label htmlFor="comment">Commentaire</Label>
            <Textarea id="comment" {...register('comment')} placeholder="Partagez votre expérience..."/>
            {errors.comment && <p className="text-xs text-destructive mt-1">{errors.comment.message}</p>}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Publication...' : 'Publier l\'avis'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
