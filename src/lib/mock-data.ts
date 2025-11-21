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
  }
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
        image: { url: PlaceHolderImages[0].imageUrl, hint: PlaceHolderImages[0].imageHint }
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
        image: { url: PlaceHolderImages[1].imageUrl, hint: PlaceHolderImages[1].imageHint }
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
        image: { url: PlaceHolderImages[2].imageUrl, hint: PlaceHolderImages[2].imageHint }
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
        image: { url: PlaceHolderImages[3].imageUrl, hint: PlaceHolderImages[3].imageHint }
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
        image: { url: PlaceHolderImages[4].imageUrl, hint: PlaceHolderImages[4].imageHint }
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
        image: { url: PlaceHolderImages[5].imageUrl, hint: PlaceHolderImages[5].imageHint }
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
        image: { url: PlaceHolderImages[6].imageUrl, hint: PlaceHolderImages[6].imageHint }
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
        image: { url: PlaceHolderImages[7].imageUrl, hint: PlaceHolderImages[7].imageHint }
    },
];

export const getHousings = async (filters: { city?: string; type?: string; min_price?: string; max_price?: string } = {}): Promise<Housing[]> => {
    // Simulate API call
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
