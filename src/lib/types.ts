

export interface Housing {
  id: string;
  title: string;
  description: string;
  type: 'kot' | 'studio' | 'colocation';
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  surface_area: number;
  imageUrl: string;
  imageHint: string;
  coordinates: [number, number];
  userId: string;
  createdAt: string;
  availableFrom?: string;
  isAvailable?: boolean;
}

export interface Post {
    id: string;
    caption: string;
    imageUrl?: string;
    location?: string;
    userId: string;
    userDisplayName: string;
    userAvatarUrl: string;
    createdAt: string;
    likes: string[];
    comments: {
        userId: string;
        userDisplayName: string;
        text: string;
    }[];
}

export interface Event {
    id: string;
    organizerId: string;
    title: string;
    description: string;
    category: 'soirée' | 'conférence' | 'sport' | 'culture';
    startDate: string;
    endDate: string;
    locationName: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    price: number;
    imageUrl: string;
    imageHint: string;
    coordinates: [number, number];
    createdAt: string;
    updatedAt: string;
}

export interface Tutor {
    id: string;
    tutorId: string;
    subject: string;
    level: string;
    pricePerHour: number;
    rating?: number;
    coordinates: [number, number];
    description: string;
    locationType: 'online' | 'in-person' | 'both';
    createdAt: string;
    updatedAt: string;
}

export interface Trip {
    id: string;
    driverId: string;
    departureCity: string;
    arrivalCity: string;
    departureTime: string;
    pricePerSeat: number;
    seatsAvailable: number;
    coordinates: [number, number];
    departureAddress: string;
    arrivalAddress: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    university: string;
    fieldOfStudy: string;
    bio: string;
    profilePicture: string;
    createdAt: any;
    updatedAt: any;
}

export interface ChatMessage {
    id: string;
    text: string;
    senderId: string;
    createdAt: any;
}

export interface Conversation {
    id: string;
    participantIds: string[];
    participants: { [key: string]: UserProfile };
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: any;
    };
    createdAt: any;
    updatedAt: any;
}
