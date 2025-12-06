

'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useStorage, setDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Film, Music, Play, Pause, Search } from 'lucide-react';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from '@/lib/avatars';


const reelSchema = z.object({
    caption: z.string().min(1, 'La légende est requise'),
    songTitle: z.string().optional(),
    audioUrl: z.string().optional(),
});

type ReelFormInputs = z.infer<typeof reelSchema>;

interface CreateReelFormProps {
    onClose: () => void;
}

const pixabayMusic = [
    // Electro / Techno / House
    { title: "Let's Go", artist: "AlexiAction", url: "https://cdn.pixabay.com/download/audio/2022/08/23/audio_82c918b3ab.mp3?filename=lets-go-by-alexiaction-from-pixabay.mp3" },
    { title: "Wake Up", artist: "MBB", url: "https://cdn.pixabay.com/download/audio/2022/05/23/audio_5539f3630f.mp3?filename=wake-up-by-mbb-from-pixabay.mp3" },
    { title: "Powerful Electro", artist: "penguinmusic", url: "https://cdn.pixabay.com/download/audio/2022/01/24/audio_33fa8130aa.mp3?filename=powerful-electro-by-penguinmusic-from-pixabay.mp3" },
    { title: "Electronic Rock", artist: "AlexGrohl", url: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_130d7b9c9b.mp3?filename=electronic-rock-king-around-here-by-alex-grohl-from-pixabay.mp3" },
    { title: "Cyber-Attack", artist: "SoundGallery", url: "https://cdn.pixabay.com/download/audio/2023/04/18/audio_70e8832a8a.mp3?filename=cyber-attack-by-soundgallery-by-pixabay.mp3" },

    // Hip Hop / Rap / Trap
    { title: "The Urban Groove", artist: "SoulProdMusic", url: "https://cdn.pixabay.com/download/audio/2023/04/24/audio_b72bccc038.mp3?filename=the-urban-groove-by-soulprodmusic-from-pixabay.mp3" },
    { title: "No-Copyright-Rap", artist: "The R-Man", url: "https://cdn.pixabay.com/download/audio/2023/08/03/audio_a167da9142.mp3?filename=no-copyright-rap-by-the-r-man-from-pixabay.mp3" },
    { title: "Trap Powerful", artist: "AlexiAction", url: "https://cdn.pixabay.com/download/audio/2022/10/26/audio_415f3cc283.mp3?filename=trap-powerful-by-alexiaction-from-pixabay.mp3" },
    { title: "Boom Bap", artist: "Leva", url: "https://cdn.pixabay.com/download/audio/2022/12/26/audio_987d395815.mp3?filename=boom-bap-by-leva-from-pixabay.mp3" },

    // Reggae
    { title: "Reggae Fun", artist: "Lesfm", url: "https://cdn.pixabay.com/download/audio/2022/08/04/audio_a84a86dc31.mp3?filename=reggae-fun-by-lesfm-from-pixabay.mp3" },
    { title: "Reggae Style", artist: "prazkhanal", url: "https://cdn.pixabay.com/download/audio/2022/04/09/audio_653594833a.mp3?filename=reggae-style-by-prazkhanal-from-pixabay.mp3" },

    // Lo-fi and Chill
    { title: "Lofi Chill", artist: "FASSounds", url: "https://cdn.pixabay.com/download/audio/2023/08/03/audio_54b28f363c.mp3?filename=lofi-chill-173895.mp3" },
    { title: "The Beat of Nature", artist: "Olexy", url: "https://cdn.pixabay.com/download/audio/2022/10/11/audio_14f3b4dce5.mp3?filename=the-beat-of-nature-122841.mp3" },
    { title: "Modern Vlog", artist: "penguinmusic", url: "https://cdn.pixabay.com/download/audio/2023/03/10/audio_51a2935041.mp3?filename=modern-vlog-140795.mp3" },
    { title: "Chill Abstract", artist: "Coma-Media", url: "https://cdn.pixabay.com/download/audio/2022/01/21/audio_873dff0b23.mp3?filename=chill-abstract-intention-12099.mp3" },

    // Hardcore / Rock
    { title: "Metal", artist: "AlexGrohl", url: "https://cdn.pixabay.com/download/audio/2022/08/02/audio_99b5963a78.mp3?filename=metal-by-alex-grohl-from-pixabay.mp3" },
    { title: "At the Top", artist: "ItsAGun", url: "https://cdn.pixabay.com/download/audio/2022/08/04/audio_33593a236f.mp3?filename=at-the-top-by-itsagundont-worry-from-pixabay.mp3" },

];

const pixabaySoundEffects = [
    { title: "Whoosh", artist: "Pixabay", url: "https://cdn.pixabay.com/download/audio/2023/05/11/audio_24f63459e9.mp3?filename=whoosh-sound-effect-152869.mp3" },
    { title: "Applaudissements", artist: "Pixabay", url: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_bb63044100.mp3?filename=small-crowd-applause-6695.mp3" },
    { title: "Goutte d'eau", artist: "Pixabay", url: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_370377259b.mp3?filename=water-drop-sound-effect-6047.mp3" },
    { title: "Notification", artist: "Pixabay", url: "https://cdn.pixabay.com/download/audio/2024/01/17/audio_404c0d2966.mp3?filename=cute-level-up-3-189853.mp3" },
    { title: "Rire", artist: "Pixabay", url: "https://cdn.pixabay.com/download/audio/2022/04-20/audio_5159072566.mp3?filename=medium-crowd-laugh-40110.mp3" }
];


function MusicSelectionDialog({ onSelectSong, onClose }: { onSelectSong: (song: { title: string, url: string }) => void, onClose: () => void }) {
    const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = async (song: { title: string, url: string }) => {
        if (!audioRef.current) return;

        if (currentlyPlaying === song.url) {
            audioRef.current.pause();
            setCurrentlyPlaying(null);
        } else {
            if (currentlyPlaying) {
                audioRef.current.pause();
            }
            audioRef.current.src = song.url;
            try {
                await audioRef.current.play();
                setCurrentlyPlaying(song.url);
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    // This can happen on rapid clicks, safely ignore.
                } else {
                    console.error("Audio play error:", error);
                    setCurrentlyPlaying(null);
                }
            }
        }
    };

    useEffect(() => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audioRef.current = audio;

        const handleEnded = () => setCurrentlyPlaying(null);
        audioRef.current.addEventListener('ended', handleEnded);

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeEventListener('ended', handleEnded);
            }
        }
    }, []);

    const filterSongs = (songs: typeof pixabayMusic) => {
        if (!searchQuery) return songs;
        return songs.filter(song =>
            song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    const renderSongList = (songs: { title: string, artist: string, url: string }[]) => (
        <div className="space-y-2">
            {songs.map(song => (
                <div key={song.url} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <div className="cursor-pointer flex-grow" onClick={() => onSelectSong(song)}>
                        <p className="font-semibold">{song.title}</p>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => togglePlay(song)}>
                        {currentlyPlaying === song.url ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                </div>
            ))}
        </div>
    );

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Choisir un son</DialogTitle>
                </DialogHeader>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une musique..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Tabs defaultValue="music" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="music">Musique</TabsTrigger>
                        <TabsTrigger value="sfx">Effets Sonores</TabsTrigger>
                    </TabsList>
                    <TabsContent value="music" className="max-h-[50vh] overflow-y-auto">
                        {renderSongList(filterSongs(pixabayMusic))}
                    </TabsContent>
                    <TabsContent value="sfx" className="max-h-[50vh] overflow-y-auto">
                        {renderSongList(filterSongs(pixabaySoundEffects))}
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


export default function CreateReelForm({ onClose }: CreateReelFormProps) {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<ReelFormInputs>({
        resolver: zodResolver(reelSchema),
    });

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const storage = useStorage();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showMusicSelection, setShowMusicSelection] = useState(false);
    const [selectedSong, setSelectedSong] = useState<{ title: string, url: string } | null>(null);

    const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setPreviewUrl(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSelectSong = (song: { title: string, url: string }) => {
        setSelectedSong(song);
        setValue('songTitle', song.title);
        setValue('audioUrl', song.url);
        setShowMusicSelection(false);
    };

    const onSubmit: SubmitHandler<ReelFormInputs> = async (data) => {
        if (!user || !firestore || !storage) {
            toast({ variant: 'destructive', title: 'Erreur', description: 'Vous devez être connecté pour publier.' });
            return;
        }
        if (!videoFile) {
            toast({ variant: 'destructive', title: 'Erreur', description: "Une vidéo est requise." });
            return;
        }

        setLoading(true);
        toast({ title: 'Publication...', description: 'Votre Reel est en cours de téléversement.' });
        onClose();

        const newDocRef = doc(collection(firestore, 'reels'));

        // Non-blocking UI update
        setDocumentNonBlocking(newDocRef, {
            ...data,
            id: newDocRef.id,
            userId: user.uid,
            username: user.displayName?.split(' ')[0] || user.email?.split('@')[0],
            userAvatarUrl: user.photoURL,
            createdAt: serverTimestamp(),
            likes: [],
            comments: [],
            videoUrl: previewUrl, // temporary local URL for optimistic UI
        }, { merge: true });

        const videoRef = storageRef(storage, `reels/${newDocRef.id}/${videoFile.name}`);
        const uploadTask = uploadBytesResumable(videoRef, videoFile);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                // You can use this progress to show a more detailed loader if needed
            },
            (error) => {
                setLoading(false);
                updateDoc(newDocRef, { uploadError: true });
                toast({ variant: "destructive", title: "Erreur de téléversement", description: "La vidéo n'a pas pu être envoyée." });
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                // Finalize the document with the real URL
                await updateDoc(newDocRef, {
                    videoUrl: downloadURL
                });
                // setLoading(false); // No need as we close the dialog instantly
            }
        );
    };

    return (
        <>
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md p-0">
                    <DialogHeader className="p-4 pb-0 border-b text-center">
                        <DialogTitle className="text-base font-semibold">Créer un nouveau Reel</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="p-4 space-y-4">
                            <div className="flex flex-col items-center justify-center aspect-video border rounded-md p-4">
                                {previewUrl ? (
                                    <div className="relative w-full h-full">
                                        <video src={previewUrl} controls className="w-full h-full rounded-md" />
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        <Film className="h-16 w-16 mx-auto" strokeWidth={1} />
                                        <p className="mt-2 text-sm">Téléchargez une vidéo</p>
                                        <Button type="button" variant="link" asChild className="mt-1">
                                            <Label htmlFor="video-upload" className="cursor-pointer">
                                                Sélectionner depuis l'ordinateur
                                            </Label>
                                        </Button>
                                        <Input id="video-upload" type="file" accept="video/*" className="sr-only" onChange={handleVideoUpload} />
                                    </div>
                                )}
                            </div>

                            {user && (
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.photoURL ?? undefined} />
                                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                    </Avatar>
                                    <Textarea
                                        id="caption"
                                        {...register('caption')}
                                        placeholder="Écrivez une légende..."
                                        className="text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none min-h-[60px]"
                                    />
                                </div>
                            )}
                            {errors.caption && <p className="text-xs text-destructive mt-2">{errors.caption.message}</p>}

                            <div className="border-t pt-4">
                                <Button variant="ghost" className="w-full justify-start p-0" type="button" onClick={() => setShowMusicSelection(true)}>
                                    <Music className="h-4 w-4 mr-2" />
                                    {selectedSong ? selectedSong.title : 'Ajouter de la musique'}
                                </Button>
                            </div>

                        </div>
                        <DialogFooter className="p-4 flex justify-end items-center bg-background border-t">
                            <Button type="submit" disabled={loading || isUserLoading || !videoFile} className="w-full">
                                {loading ? 'Publication...' : 'Partager'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {showMusicSelection && <MusicSelectionDialog onSelectSong={handleSelectSong} onClose={() => setShowMusicSelection(false)} />}
        </>
    );
}
