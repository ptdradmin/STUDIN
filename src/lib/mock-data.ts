
import { PlaceHolderImages } from "./placeholder-images";

export interface Housing {
  id: number;
  title: string;
  description: string;
  type: 'kot' | 'studio' | 'colocation';
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  surface_area: number;
  university_nearby: string;
  image: {
    url: string;
    hint: string;
  };
  coordinates: [number, number];
}

export interface Post {
    id: number;
    user: {
        name: string;
        avatarUrl: string;
    };
    imageUrl: string;
    caption: string;
    likes: number;
    comments: {
        user: string;
        text: string;
    }[];
}

export interface Event {
    id: number;
    title: string;
    category: string;
    date: string;
    location: string;
    imageUrl: string;
    imageHint: string;
    coordinates: [number, number];
}

export interface Tutor {
    id: number;
    name: string;
    avatar: string;
    subject: string;
    level: string;
    university: string;
    rate: string;
    rating: number;
    coordinates: [number, number];
}

export interface Trip {
    id: number;
    driver: string;
    avatar: string;
    departure: string;
    arrival: string;
    date: string;
    time: string;
    price: string;
    seats: number;
    coordinates: [number, number];
}


const housingsData: Housing[] = [
    {
        id: 1,
        title: "Kot de charme près de l'UNamur",
        description: "Superbe kot meublé et lumineux, idéalement situé à 5 minutes à pied de l'Université de Namur. Cuisine et salle de bain communes.",
        type: 'kot',
        price: 380,
        address: "Rue de Bruxelles 53, 5000 Namur",
        city: "Namur",
        bedrooms: 1,
        surface_area: 18,
        university_nearby: "Université de Namur",
        image: { url: PlaceHolderImages[0].imageUrl, hint: PlaceHolderImages[0].imageHint },
        coordinates: [50.4674, 4.8654]
    },
    {
        id: 2,
        title: "Studio moderne au Sart-Tilman",
        description: "Studio neuf avec cuisine équipée et salle de bain privée. Parfait pour un étudiant de l'ULiège. Transport en commun à proximité.",
        type: 'studio',
        price: 550,
        address: "Boulevard de Colonster 2, 4000 Liège",
        city: "Liège",
        bedrooms: 1,
        surface_area: 30,
        university_nearby: "Université de Liège",
        image: { url: PlaceHolderImages[1].imageUrl, hint: PlaceHolderImages[1].imageHint },
        coordinates: [50.5857, 5.5683]
    },
    {
        id: 3,
        title: "Colocation conviviale à Louvain-la-Neuve",
        description: "Rejoins notre super coloc de 4 personnes ! Ambiance studieuse et festive. Grande pièce de vie commune et jardin.",
        type: 'colocation',
        price: 450,
        address: "Place des Sciences 3, 1348 Louvain-la-Neuve",
        city: "Louvain-la-Neuve",
        bedrooms: 4,
        surface_area: 120,
        university_nearby: "UCLouvain",
        image: { url: PlaceHolderImages[2].imageUrl, hint: PlaceHolderImages[2].imageHint },
        coordinates: [50.6693, 4.6154]
    },
    {
        id: 4,
        title: "Studio cosy proche ULB Solbosch",
        description: "Agréable studio meublé dans un quartier calme et verdoyant, à deux pas du campus du Solbosch. Parfait pour un étudiant cherchant la tranquillité.",
        type: 'studio',
        price: 600,
        address: "Avenue Franklin Roosevelt 50, 1050 Bruxelles",
        city: "Bruxelles",
        bedrooms: 1,
        surface_area: 28,
        university_nearby: "ULB - Université Libre de Bruxelles",
        image: { url: PlaceHolderImages[3].imageUrl, hint: PlaceHolderImages[3].imageHint },
        coordinates: [50.8124, 4.3828]
    },
    {
        id: 5,
        title: "Kot rénové - Centre de Mons",
        description: "Kot entièrement rénové dans une maison de maître. Espaces communs modernes et grande cuisine. Proche de toutes les facultés de l'UMons.",
        type: 'kot',
        price: 400,
        address: "Rue de Nimy 45, 7000 Mons",
        city: "Mons",
        bedrooms: 1,
        surface_area: 20,
        university_nearby: "UMons",
        image: { url: PlaceHolderImages[4].imageUrl, hint: PlaceHolderImages[4].imageHint },
        coordinates: [50.4578, 3.9535]
    },
    {
        id: 6,
        title: "Grande chambre en colocation - HEC Liège",
        description: "Chambre spacieuse dans une colocation de 3 étudiants HEC. Appartement lumineux avec balcon. Ambiance de travail et d'entraide.",
        type: 'colocation',
        price: 480,
        address: "Rue Louvrex 14, 4000 Liège",
        city: "Liège",
        bedrooms: 3,
        surface_area: 110,
        university_nearby: "HEC Liège",
        image: { url: PlaceHolderImages[5].imageUrl, hint: PlaceHolderImages[5].imageHint },
        coordinates: [50.6358, 5.5645]
    },
    {
        id: 7,
        title: "Kot pratique et économique à Namur",
        description: "Kot simple et fonctionnel, idéal pour un budget serré. Accès rapide aux facultés et au centre-ville.",
        type: 'kot',
        price: 320,
        address: "Rue de l'Arsenal 8, 5000 Namur",
        city: "Namur",
        bedrooms: 1,
        surface_area: 15,
        university_nearby: "Université de Namur",
        image: { url: PlaceHolderImages[6].imageUrl, hint: PlaceHolderImages[6].imageHint },
        coordinates: [50.4651, 4.8689]
    },
    {
        id: 8,
        title: "Studio avec terrasse près de l'UCLouvain",
        description: "Rare ! Studio avec terrasse privée, parfait pour profiter du soleil. Entièrement équipé et meublé avec goût.",
        type: 'studio',
        price: 590,
        address: "Voie du Roman Pays 20, 1348 Louvain-la-Neuve",
        city: "Louvain-la-Neuve",
        bedrooms: 1,
        surface_area: 35,
        university_nearby: "UCLouvain",
        image: { url: PlaceHolderImages[7].imageUrl, hint: PlaceHolderImages[7].imageHint },
        coordinates: [50.668, 4.618]
    },
];

const postsData: Post[] = [
    {
        id: 1,
        user: { name: 'Alice', avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=alice' },
        imageUrl: 'https://picsum.photos/seed/social1/1080/1080',
        caption: 'Journée d\'étude à la bibliothèque ! 📚 #studentlife',
        likes: 128,
        comments: [{ user: 'Bob', text: 'Bon courage !' }]
    },
    {
        id: 2,
        user: { name: 'Bob', avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=bob' },
        imageUrl: 'https://picsum.photos/seed/social2/1080/1080',
        caption: 'Petite pause café entre deux cours ☕',
        likes: 95,
        comments: [{ user: 'Charlie', text: 'Bien mérité !' }, { user: 'Alice', text: 'La même !' }]
    },
     {
        id: 3,
        user: { name: 'Charlie', avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=charlie' },
        imageUrl: 'https://picsum.photos/seed/social3/1080/1080',
        caption: 'Soirée BDE ce soir ! 🎉 Qui vient ?',
        likes: 230,
        comments: []
    }
];

const eventsData: Event[] = [
    {
        id: 1,
        title: "Soirée d'intégration BDE Info",
        category: "Soirée",
        date: "25 Octobre",
        location: "ULB - Campus du Solbosch, Bruxelles",
        imageUrl: "https://picsum.photos/seed/event1/600/400",
        imageHint: "party people",
        coordinates: [50.8126, 4.3822]
    },
    {
        id: 2,
        title: "Conférence sur l'IA et l'avenir du travail",
        category: "Conférence",
        date: "28 Octobre",
        location: "UNamur - Auditoire Pedro A.",
        imageUrl: "https://picsum.photos/seed/event2/600/400",
        imageHint: "conference stage",
        coordinates: [50.4669, 4.8674]
    },
    {
        id: 3,
        title: "Tournoi de foot inter-facultés",
        category: "Sport",
        date: "02 Novembre",
        location: "Centre Sportif de Louvain-la-Neuve",
        imageUrl: "https://picsum.photos/seed/event3/600/400",
        imageHint: "soccer game",
        coordinates: [50.6654, 4.6119]
    }
]

const tutorsData: Tutor[] = [
    {
        id: 1,
        name: "Léa Dubois",
        avatar: "https://api.dicebear.com/7.x/micah/svg?seed=lea",
        subject: "Mathématiques",
        level: "Master 1",
        university: "UCLouvain",
        rate: "20€/h",
        rating: 4.9,
        coordinates: [50.6693, 4.6154]
    },
    {
        id: 2,
        name: "Hugo Lambert",
        avatar: "https://api.dicebear.com/7.x/micah/svg?seed=hugo",
        subject: "Droit Constitutionnel",
        level: "Master 2",
        university: "ULB",
        rate: "25€/h",
        rating: 5.0,
        coordinates: [50.8124, 4.3828]
    },
    {
        id: 3,
        name: "Chloé Simon",
        avatar: "https://api.dicebear.com/7.x/micah/svg?seed=chloe",
        subject: "Chimie Organique",
        level: "Bachelier 3",
        university: "UNamur",
        rate: "18€/h",
        rating: 4.8,
        coordinates: [50.4674, 4.8654]
    }
]

const tripsData: Trip[] = [
    {
        id: 1,
        driver: "Alexandre D.",
        avatar: "https://api.dicebear.com/7.x/micah/svg?seed=alex",
        departure: "Bruxelles-Midi",
        arrival: "Namur",
        date: "Demain",
        time: "08:30",
        price: "5€",
        seats: 2,
        coordinates: [50.8358, 4.3355]
    },
    {
        id: 2,
        driver: "Marie L.",
        avatar: "https://api.dicebear.com/7.x/micah/svg?seed=marie",
        departure: "Liège-Guillemins",
        arrival: "Louvain-la-Neuve",
        date: "Demain",
        time: "07:45",
        price: "7€",
        seats: 1,
        coordinates: [50.6251, 5.5663]
    }
]


export const getHousings = async (filters: { city?: string; type?: string; min_price?: string; max_price?: string } = {}): Promise<Housing[]> => {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredHousings = housingsData;

    if (filters.city) {
        filteredHousings = filteredHousings.filter(h => h.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    if (filters.type) {
        filteredHousings = filteredHousings.filter(h => h.type === filters.type);
    }
    if (filters.min_price) {
        filteredHousings = filteredHousings.filter(h => h.price >= parseInt(filters.min_price!, 10));
    }
    if (filters.max_price) {
        filteredHousings = filteredHousings.filter(h => h.price <= parseInt(filters.max_price!, 10));
    }
    
    return filteredHousings;
}


export const getPosts = async (): Promise<Post[]> => {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 300));
    return postsData;
}

export const getEvents = async (): Promise<Event[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return eventsData;
}

export const getTutors = async (): Promise<Tutor[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return tutorsData;
}

export const getTrips = async (): Promise<Trip[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return tripsData;
}
