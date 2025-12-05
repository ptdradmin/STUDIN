

'use client';

import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useStorage, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { ImageIcon, Calendar as CalendarIcon } from 'lucide-react';
import { staticChallenges } from '@/lib/static-data';
import type { Event } from '@/lib/types';

const FormSection = ({ title, description, children }: { title: string, description?: string, children: React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b pb-6">
        <div className="md:col-span-1">
            <h3 className="font-semibold text-base">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="md:col-span-2 space-y-4">
            {children}
        </div>
    </div>
);


const eventSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().min(1, 'La description est requise'),
  category: z.enum(['soirée', 'conférence', 'sport', 'culture'], { required_error: 'La catégorie est requise' }),
  startDate: z.date({ required_error: 'La date est requise.' }),
  price: z.preprocess((val) => Number(val), z.number().min(0, 'Le prix est requis')),
  city: z.string().min(1, 'La ville est requise'),
  address: z.string().min(1, "L'adresse est requise"),
  university: z.string().optional(),
});

type EventFormInputs = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
  onClose: () => void;
}

const schoolsList = [
    'Université de Namur', 'Université de Liège', 'UCLouvain', 'ULB - Université Libre de Bruxelles', 'UMons', 'Université Saint-Louis - Bruxelles',
    'HEC Liège', 'HEPL - Haute École de la Province de Liège', 'HELMo - Haute École Libre Mosane',
    'Haute École de la Province de Namur (HEPN)', 'Haute École Louvain en Hainaut (HELHa)', 'Haute École Libre de Bruxelles - Ilya Prigogine (HELB)',
    'Haute École Galilée (HEG)', 'Haute École ICHEC - ECAM - ISFSC', 'Haute École de Bruxelles-Brabant (HE2B)',
    'Haute École Francisco Ferrer', 'Haute École Léonard de Vinci', 'Haute École Robert Schuman',
    'Académie royale des Beaux-Arts de Bruxelles (ArBA-EsA)', 'La Cambre', 'Institut national supérieur des arts du spectacle (INSAS)',
    'École supérieure des Arts Saint-Luc de Bruxelles', "École supérieure des Arts de l'Image 'Le 75'",
    'Autre'
];


export default function CreateEventForm({ onClose }: CreateEventFormProps) {
  const { register, handleSubmit, control, formState: { errors }, setValue, watch } = useForm<EventFormInputs>({
    resolver: zodResolver(eventSchema),
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, isUserLoading } = useAuth();
  const firestore = useFirestore();
  const storage = useStorage();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const selectedDate = watch('startDate');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTimeChange = (type: 'hours' | 'minutes', value: string) => {
    const newDate = selectedDate || new Date();
    const numberValue = parseInt(value, 10);
    if (type === 'hours') {
        setValue('startDate', setHours(newDate, numberValue), { shouldValidate: true });
    } else {
        setValue('startDate', setMinutes(newDate, numberValue), { shouldValidate: true });
    }
  };

  const onSubmit: SubmitHandler<EventFormInputs> = (data) => {
    if (!user || !firestore || !storage) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté.' });
      return;
    }
    if (!imageFile || !previewUrl) {
        toast({ variant: 'destructive', title: 'Erreur', description: "L'image est requise." });
        return;
    }
    setLoading(true);
    toast({ title: 'Création...', description: 'Votre événement est en cours de publication.' });
    onClose();

    const newDocRef = doc(collection(firestore, 'events'));
    const baseChallenge = staticChallenges[Math.floor(Math.random() * staticChallenges.length)];
    const newCoords: [number, number] = [
        (baseChallenge.latitude || 50.46) + (Math.random() - 0.05),
        (baseChallenge.longitude || 4.87) + (Math.random() - 0.05),
    ];

    const eventData: Omit<Event, 'updatedAt' | 'createdAt' | 'id' | 'startDate' | 'endDate'> & { startDate: any, endDate: any, createdAt: any } = {
        ...data,
        organizerId: user.uid,
        username: user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Anonyme',
        userAvatarUrl: user.photoURL || undefined,
        startDate: serverTimestamp(),
        endDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        attendeeIds: [],
        locationName: data.address,
        coordinates: newCoords,
        imageHint: "student event",
        imageUrl: previewUrl,
        latitude: newCoords[0],
        longitude: newCoords[1],
    };
    
    setDocumentNonBlocking(newDocRef, { ...eventData, id: newDocRef.id }, { merge: false });
    
    const imageRef = storageRef(storage, `events/${newDocRef.id}/${imageFile.name}`);
    const uploadTask = uploadBytesResumable(imageRef, imageFile);

    uploadTask.on('state_changed', 
        () => {},
        (error) => {
            console.error("Upload error:", error);
            updateDocumentNonBlocking(newDocRef, { uploadError: true });
        },
        async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            updateDocumentNonBlocking(newDocRef, {
                imageUrl: downloadURL,
                updatedAt: serverTimestamp()
            });
        }
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Créer un événement</DialogTitle>
           <DialogDescription>Remplissez les détails pour promouvoir votre événement.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto p-1 pr-4">
          <FormSection title="Image de l'événement" description="Une image attrayante pour votre événement.">
            <div className="flex flex-col items-center justify-center aspect-video border rounded-md p-2 bg-muted/50">
                {previewUrl ? (
                <div className="relative w-full h-full">
                    <Image src={previewUrl} alt="Aperçu de l'image" layout="fill" objectFit="contain" />
                </div>
                ) : (
                <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-16 w-16 mx-auto" strokeWidth={1} />
                    <p className="mt-2 text-sm">Téléchargez une image</p>
                </div>
                )}
            </div>
            <div>
                <Label htmlFor="imageUrl" className="sr-only">Image</Label>
                <Input id="imageUrl" type="file" accept="image/*" onChange={handleImageUpload} />
            </div>
          </FormSection>

          <FormSection title="Informations principales" description="Les détails essentiels de votre événement.">
              <div>
                <Label htmlFor="title">Titre de l'événement</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>
            <div>
                <Label htmlFor="category">Catégorie</Label>
                <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Sélectionner la catégorie" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="soirée">Soirée</SelectItem>
                                <SelectItem value="conférence">Conférence</SelectItem>
                                <SelectItem value="sport">Sport</SelectItem>
                                <SelectItem value="culture">Culture</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>
          </FormSection>

          <FormSection title="Date et Heure" description="Quand l'événement aura-t-il lieu ?">
            <div className="space-y-2">
                <Label>Date et heure de début</Label>
                <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                    <Controller
                        name="startDate"
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
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
            </div>
          </FormSection>

          <FormSection title="Lieu et Prix" description="Où se déroule l'événement et quel est le coût ?">
             <div>
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" {...register('address')} placeholder="Ex: Rue de l'université 10" />
                {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="city">Ville</Label>
                        <Input id="city" {...register('city')} placeholder="Ex: Namur" />
                        {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="price">Prix (€)</Label>
                        <Input id="price" type="number" {...register('price')} defaultValue={0} />
                        {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
                    </div>
                </div>
          </FormSection>
          
           <FormSection title="Informations Additionnelles" description="(Optionnel)">
             <div>
                <Label htmlFor="university">Université</Label>
                 <Controller
                    name="university"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger><SelectValue placeholder="Sélectionnez une université" /></SelectTrigger>
                            <SelectContent>
                                {schoolsList.map(uni => (
                                    <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
           </FormSection>


          <DialogFooter className="sticky bottom-0 bg-background pt-4 -m-1 -mb-4 p-6 border-t">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
            </DialogClose>
            <Button type="submit" disabled={loading || isUserLoading}>
              {loading ? 'Création...' : "Créer l'événement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
