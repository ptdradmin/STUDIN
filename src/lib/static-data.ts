

import type { Challenge } from './types';
import { Timestamp } from 'firebase/firestore';

export const staticChallenges: Challenge[] = [
  // --- NAMUR FACILE ---
  {
    id: 'namur-facile-1',
    creatorId: 'admin-studin',
    title: "Selfie au Beffroi de Namur",
    description: "Prenez un selfie avec le Beffroi de Namur, classé au patrimoine de l'UNESCO. Un incontournable de la ville !",
    category: 'Exploration',
    difficulty: 'facile',
    points: 10,
    imageUrl: 'https://images.unsplash.com/photo-1632194634234-a8a25c197d62?q=80&w=1964&auto=format&fit=crop',
    location: 'Namur',
    latitude: 50.4673,
    longitude: 4.8675,
    createdAt: new Timestamp(1672531200, 0),
  },
  {
    id: 'namur-facile-2',
    creatorId: 'admin-studin',
    title: "La Tortue de Jan Fabre",
    description: "Trouvez la statue 'Searching for Utopia' (la grande tortue dorée) au sommet de la Citadelle et prenez une photo originale avec elle.",
    category: 'Créatif',
    difficulty: 'facile',
    points: 15,
    imageUrl: 'https://images.unsplash.com/photo-1593106578502-27fa837e997a?q=80&w=2070&auto=format&fit=crop',
    location: 'Namur',
    latitude: 50.4593,
    longitude: 4.8625,
    createdAt: new Timestamp(1672531201, 0),
  },
   {
    id: 'namur-facile-3',
    creatorId: 'admin-studin',
    title: "Pause Verte au Parc Louise-Marie",
    description: "Trouvez un banc dans le Parc Louise-Marie et prenez une photo de votre moment de détente (un livre, de la musique, etc.).",
    category: 'Environnement',
    difficulty: 'facile',
    points: 10,
    imageUrl: 'https://images.unsplash.com/photo-1594732521992-98436e4f3a74?q=80&w=1974&auto=format&fit=crop',
    location: 'Namur',
    latitude: 50.4633,
    longitude: 4.8601,
    createdAt: new Timestamp(1672531202, 0),
  },
  
  // --- NAMUR MOYEN ---
  {
    id: 'namur-moyen-1',
    creatorId: 'admin-studin',
    title: "Fresque des Wallons en Scène",
    description: "Trouvez la 'Fresque des Wallons' et recréez de manière originale la pose d'un des personnages. Mettez en scène votre version !",
    category: 'Créatif',
    difficulty: 'moyen',
    points: 25,
    imageUrl: 'https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=2070&auto=format&fit=crop',
    location: 'Namur',
    latitude: 50.464,
    longitude: 4.866,
    createdAt: new Timestamp(1672531203, 0),
  },
  {
    id: 'namur-moyen-2',
    creatorId: 'admin-studin',
    title: "Jogging sur le HALAGE",
    description: "Faites un jogging ou une marche rapide le long de la Meuse sur le chemin de halage. Prenez un selfie avec le pont de Jambes en arrière-plan pour prouver votre effort !",
    category: 'Sportif',
    difficulty: 'moyen',
    points: 30,
    imageUrl: 'https://images.unsplash.com/photo-1615478511032-1b151322e681?q=80&w=1974&auto=format&fit=crop',
    location: 'Namur',
    latitude: 50.4578,
    longitude: 4.87,
    createdAt: new Timestamp(1672531204, 0),
  },
  
  // --- BRUXELLES FACILE ---
  {
    id: 'bxl-facile-1',
    creatorId: 'admin-studin',
    title: "L'Atomium Iconique",
    description: "Prenez une photo créative avec l'Atomium en arrière-plan. Surprenez-nous !",
    category: 'Exploration',
    difficulty: 'facile',
    points: 10,
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?q=80&w=1964&auto=format&fit=crop',
    location: 'Bruxelles',
    latitude: 50.8949,
    longitude: 4.3415,
    createdAt: new Timestamp(1672531205, 0),
  },

  // --- BRUXELLES MOYEN ---
  {
    id: 'bxl-moyen-1',
    creatorId: 'admin-studin',
    title: "Street Art à Laeken",
    description: "Trouvez et photographiez une fresque de street art originale dans le quartier de Laeken, près du site de Tour & Taxis.",
    category: 'Créatif',
    difficulty: 'moyen',
    points: 20,
    imageUrl: 'https://images.unsplash.com/photo-1599709835737-27b6b15a7e6b?q=80&w=1974&auto=format&fit=crop',
    location: 'Bruxelles',
    latitude: 50.8688,
    longitude: 4.348,
    createdAt: new Timestamp(1672531206, 0),
  },

  // --- BRUXELLES DIFFICILE ---
  {
    id: 'bxl-difficile-1',
    creatorId: 'admin-studin',
    title: "Perspective sur la Tour des Finances",
    description: "Trouvez un angle de vue unique et artistique pour photographier la Tour des Finances depuis le Jardin Botanique, en incluant un élément végétal au premier plan.",
    category: 'Exploration',
    difficulty: 'difficile',
    points: 40,
    imageUrl: 'https://images.unsplash.com/photo-1608269733436-0c9f53c15812?q=80&w=1964&auto=format&fit=crop',
    location: 'Bruxelles',
    latitude: 50.854,
    longitude: 4.364,
    createdAt: new Timestamp(1672531207, 0),
  },
];


export const schoolsList = [
    // Universités
    'Université de Namur (UNamur)',
    'Université de Liège (ULiège)',
    'UCLouvain',
    'Université Libre de Bruxelles (ULB)',
    'Université de Mons (UMons)',
    'Université Saint-Louis - Bruxelles (USL-B)',
    // Hautes Écoles
    'HEC Liège',
    'HEPL - Haute École de la Province de Liège',
    'HELMo - Haute École Libre Mosane',
    'Haute École Albert Jacquard (HEAJ)',
    'Haute École de la Province de Namur (HEPN)',
    'Haute École Louvain en Hainaut (HELHa)',
    'Haute École Libre de Bruxelles - Ilya Prigogine (HELB)',
    'Haute École Galilée (HEG)',
    'Haute École ICHEC - ECAM - ISFSC',
    'Haute École de Bruxelles-Brabant (HE2B)',
    'Haute École Francisco Ferrer',
    'Haute École Léonard de Vinci',
    'Haute École Robert Schuman',
    'Haute École de la Ville de Liège (HEL)',
    'Haute École Charlemagne (HECh)',
    // Hautes Écoles Provinciales
    'Haute École Provinciale de Hainaut - Condorcet',
    // Écoles Supérieures des Arts
    'Académie royale des Beaux-Arts de Bruxelles (ArBA-EsA)',
    'La Cambre (ENSAV)',
    'Institut national supérieur des arts du spectacle (INSAS)',
    'École supérieure des Arts Saint-Luc de Bruxelles',
    "École supérieure des Arts de l'Image 'Le 75'",
    'Conservatoire royal de Bruxelles',
    'Conservatoire royal de Liège',
    'Arts²',
    // Promotion Sociale
    'Institut provincial de Promotion sociale (IPC)',
    'EPFC - Promotion Sociale',
    'École Industrielle et Commerciale de la Province de Namur (EICPN)',
    'IEPSCF - Uccle',
    // IFAPME
    'IFAPME - Namur',
    'IFAPME - Liège',
    'IFAPME - Charleroi',
    'IFAPME - Mons',
    'IFAPME - Wavre',
    // Autre
    'Autre'
];
