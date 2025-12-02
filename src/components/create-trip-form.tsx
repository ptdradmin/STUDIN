
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Car, Users } from 'lucide-react';

const CarIllustration = () => (
    <div className="relative w-48 h-64 mx-auto">
        <svg viewBox="0 0 100 150" className="w-full h-full">
            {/* Car body */}
            <path d="M10 50 C0 60, 0 130, 10 140 L90 140 C100 130, 100 60, 90 50 Z" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2"/>
            <path d="M15 48 C5 58, 5 80, 15 85 L85 85 C95 80, 95 58, 85 48 Z" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2"/>
            {/* Windshield */}
            <path d="M20 48 L80 48 L85 40 L15 40 Z" fill="hsl(var(--accent))" stroke="hsl(var(--border))" strokeWidth="1.5" />

            {/* Seats */}
            {/* Front seats */}
            <rect x="25" y="55" width="20" height="30" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1"/>
            <rect x="55" y="55" width="20" height="30" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1"/>
            
            {/* Back seats */}
            <rect x="20" y="95" width="20" height="30" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1"/>
            <rect x="40" y="95" width="20" height="30" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1"/>
            <rect x="60" y="95" width="20" height="30" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1"/>
        </svg>
    </div>
);


const tripSchema = z.object({
  departureCity: z.string().min(1, 'La ville de départ est requise'),
  arrivalCity: z.string().min(1, "La ville d'arrivée est requise"),
  departureTime: z.date({ required_error: "L'heure de départ est requise"}),
  seatsAvailable: z.preprocess((val) => Number(val), z.number().min(1, 'Le nombre de sièges est requis')),
  pricePerSeat: z.preprocess((val) => Number(val), z.number().min(0, 'Le prix est requis')),
  description: z.string().optional(),
});

type TripFormInputs = z.infer<typeof tripSchema>;

interface CreateTripFormProps {
  onClose: () => void;
}

export default function CreateTripForm({ onClose }: CreateTripFormProps) {
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<TripFormInputs>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      seatsAvailable: 1,
      pricePerSeat: 5,
    }
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useAuth();
  const firestore = useFirestore();
  
  const selectedDate = watch('departureTime');

  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    const newDate = selectedDate || new Date();
    const numberValue = parseInt(value, 10);
    if (type === 'hours') {
        setValue('departureTime', setHours(newDate, numberValue), { shouldValidate: true });
    } else {
        setValue('departureTime', setMinutes(newDate, numberValue), { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<TripFormInputs> = (data) => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour proposer un trajet.' });
      return;
    }
    setLoading(true);
    onClose();
    toast({ title: 'Création...', description: 'Votre trajet est en cours de publication.' });

    const carpoolingsCollection = collection(firestore, 'carpoolings');
    const newDocRef = doc(carpoolingsCollection);
    
    const finalDepartureTime = data.departureTime.toISOString();

    const tripData = {
        ...data,
        departureTime: finalDepartureTime,
        id: newDocRef.id,
        driverId: user.uid,
        username: user.displayName?.split(' ')[0] || user.email?.split('@')[0],
        userAvatarUrl: user.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        passengerIds: [],
        departureAddress: data.departureCity, // simplified
        arrivalAddress: data.arrivalCity, // simplified
        coordinates: [50.4674, 4.8720] // Default to Namur, TODO: Geocode
    };
    
    setDocumentNonBlocking(newDocRef, tripData);
    toast({ title: 'Succès', description: 'Trajet proposé avec succès !' });
    setLoading(false); // Not strictly necessary as modal closes, but good practice.
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proposer un trajet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <Label htmlFor="departureCity">Départ</Label>
              <Input id="departureCity" {...register('departureCity')} placeholder="Ex: Bruxelles" />
              {errors.departureCity && <p className="text-xs text-destructive">{errors.departureCity.message}</p>}
            </div>
            <div>
              <Label htmlFor="arrivalCity">Arrivée</Label>
              <Input id="arrivalCity" {...register('arrivalCity')} placeholder="Ex: Namur" />
              {errors.arrivalCity && <p className="text-xs text-destructive">{errors.arrivalCity.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Date et heure de départ</Label>
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                 <Controller
                    name="departureTime"
                    control={control}
                    render={({ field }) => (
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => date && field.onChange(date)}
                                initialFocus
                                locale={fr}
                                />
                            </PopoverContent>
                        </Popover>
                    )}
                />
                 <Select onValueChange={(value) => handleTimeChange('hours', value)} defaultValue={selectedDate ? format(selectedDate, 'HH') : undefined}>
                    <SelectTrigger className="w-[80px]"><SelectValue placeholder="HH" /></SelectTrigger>
                    <SelectContent>{Array.from({ length: 24 }).map((_, i) => <SelectItem key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</SelectItem>)}</SelectContent>
                </Select>
                <Select onValueChange={(value) => handleTimeChange('minutes', value)} defaultValue={selectedDate ? format(selectedDate, 'mm') : undefined}>
                    <SelectTrigger className="w-[80px]"><SelectValue placeholder="MM" /></SelectTrigger>
                    <SelectContent>{Array.from({ length: 12 }).map((_, i) => <SelectItem key={i} value={String(i * 5).padStart(2, '0')}>{String(i * 5).padStart(2, '0')}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            {errors.departureTime && <p className="text-xs text-destructive">{errors.departureTime.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-8 items-center">
             <CarIllustration />
             <div className="space-y-4">
                 <div>
                    <Label htmlFor="seatsAvailable">Places disponibles</Label>
                    <Input id="seatsAvailable" type="number" {...register('seatsAvailable')} className="mt-1" />
                    {errors.seatsAvailable && <p className="text-xs text-destructive">{errors.seatsAvailable.message}</p>}
                </div>
                <div>
                    <Label htmlFor="pricePerSeat">Prix par place (€)</Label>
                    <Input id="pricePerSeat" type="number" {...register('pricePerSeat')} className="mt-1"/>
                    {errors.pricePerSeat && <p className="text-xs text-destructive">{errors.pricePerSeat.message}</p>}
                </div>
             </div>
          </div>

           <div>
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea id="description" {...register('description')} placeholder="Ex: Voyage tranquille, musique bienvenue..." className="mt-1"/>
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-4">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || isUserLoading}>
              {loading ? 'Création...' : 'Proposer le trajet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
