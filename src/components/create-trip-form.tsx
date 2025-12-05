
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
import { collection, serverTimestamp, doc, Timestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Car, Users } from 'lucide-react';
import { staticChallenges } from '@/lib/static-data';


const CarIllustration = ({ availableSeats }: { availableSeats: number }) => {
  const seats = [
    { id: 'front_passenger', path: "M 66 52.5 C 76 52.5 76 82.5 66 82.5 L 56 82.5 C 46 82.5 46 52.5 56 52.5 Z" },
    { id: 'rear_left', path: "M 38 88.5 C 48 88.5 48 118.5 38 118.5 L 28 118.5 C 18 118.5 18 88.5 28 88.5 Z" },
    { id: 'rear_middle', path: "M 60 88.5 C 70 88.5 70 118.5 60 118.5 L 50 118.5 C 40 118.5 40 88.5 50 88.5 Z" },
    { id: 'rear_right', path: "M 82 88.5 C 92 88.5 92 118.5 82 118.5 L 72 118.5 C 62 118.5 62 88.5 72 88.5 Z" },
  ];

  return (
    <div className="relative w-48 h-64 mx-auto">
      <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-lg">
        <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
                <feOffset dx="1" dy="2" result="offsetblur"/>
                <feFlood floodColor="rgba(0,0,0,0.1)"/>
                <feComposite in2="offsetblur" operator="in"/>
                <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <linearGradient id="windshield" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.4"/>
            </linearGradient>
             <linearGradient id="seat-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity="0.1"/>
                <stop offset="100%" stopColor="black" stopOpacity="0.1"/>
            </linearGradient>
        </defs>

        {/* Car body with shadow */}
        <path d="M 8,40 C -2,50 -2,125 8,140 L 92,140 C 102,125 102,50 92,40 Z" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" filter="url(#shadow)"/>
        
        {/* Windows */}
        <path d="M 15,40 C 10,30 90,30 85,40 L 80,85 C 95,85 95,100 80,100 L 20,100 C 5,100 5,85 20,85 Z" fill="url(#windshield)" stroke="hsl(var(--border))" strokeWidth="1.5" />

        {/* Dashboard */}
        <path d="M 20 45 A 20 20 0 0 1 80 45" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1.5" />
        
        {/* Steering wheel */}
        <circle cx="32" cy="40" r="8" stroke="hsl(var(--border))" strokeWidth="2" fill="hsl(var(--card))"/>
        <line x1="32" y1="32" x2="32" y2="48" stroke="hsl(var(--border))" strokeWidth="1.5"/>

        {/* Driver seat (always unavailable) */}
        <path d="M 44 52.5 C 54 52.5 54 82.5 44 82.5 L 34 82.5 C 24 82.5 24 52.5 34 52.5 Z" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1"/>
        <path d="M 44 52.5 C 54 52.5 54 82.5 44 82.5 L 34 82.5 C 24 82.5 24 52.5 34 52.5 Z" fill="url(#seat-gradient)"/>

        {/* Passenger seats */}
        {seats.map((seat, index) => (
          <g key={seat.id}>
             <path
                d={seat.path}
                className="transition-colors duration-300"
                fill={index < availableSeats ? "hsl(var(--primary))" : "hsl(var(--card))"}
                stroke="hsl(var(--border))" 
                strokeWidth="1"
            />
            <path d={seat.path} fill="url(#seat-gradient)" />
          </g>
        ))}
      </svg>
    </div>
  );
};


const tripSchema = z.object({
  departureCity: z.string().min(1, 'La ville de départ est requise'),
  arrivalCity: z.string().min(1, "La ville d'arrivée est requise"),
  departureTime: z.date({ required_error: "L'heure de départ est requise"}),
  seatsAvailable: z.preprocess((val) => Number(val), z.number().min(1, 'Le nombre de sièges est requis').max(4, 'Le maximum est de 4 places.')),
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
  const availableSeats = watch('seatsAvailable');


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
    toast({ title: 'Création...', description: 'Votre trajet est en cours de publication.' });

    const newDocRef = doc(collection(firestore, 'carpoolings'));
    
    const finalDepartureTime = Timestamp.fromDate(data.departureTime);
    const baseChallenge = staticChallenges[Math.floor(Math.random() * staticChallenges.length)];
    const newCoords: [number, number] = [
        (baseChallenge.latitude || 50.46) + (Math.random() - 0.5) * 0.05,
        (baseChallenge.longitude || 4.87) + (Math.random() - 0.5) * 0.05,
    ];

    const tripData = {
        ...data,
        departureTime: finalDepartureTime,
        id: newDocRef.id,
        driverId: user.uid,
        username: user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Conducteur',
        userAvatarUrl: user.photoURL || undefined,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        passengerIds: [],
        departureAddress: data.departureCity, // simplified
        arrivalAddress: data.arrivalCity, // simplified
        coordinates: newCoords,
    };
    
    setDocumentNonBlocking(newDocRef, tripData, { merge: false });
    toast({ title: 'Succès', description: 'Trajet proposé avec succès !' });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Proposer un trajet</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour partager votre trajet avec d'autres étudiants.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-1 pr-4">
          <div className="space-y-4 border-b pb-4">
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
          </div>
          
          <div className="space-y-2 border-b pb-4">
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


          <div className="grid grid-cols-2 gap-8 items-center border-b pb-4">
             <CarIllustration availableSeats={availableSeats || 0} />
             <div className="space-y-4">
                 <div>
                    <Label htmlFor="seatsAvailable">Places disponibles (1-4)</Label>
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

          <DialogFooter className="sticky bottom-0 bg-background pt-4 -m-1 px-0 -mb-4">
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
