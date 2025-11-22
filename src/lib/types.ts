

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
}

export interface Post {
    id: string;
    caption: string;
    imageUrl: string;
    userId: string;
    userDisplayName: string;
    userAvatarUrl: string;
    createdAt: string;
    likes?: number;
    comments?: {
        user: string;
        text: string;
    }[];
}

export interface Event {
    id: string;
    title: string;
    category: string;
    startDate: string;
    city: string;
    imageUrl: string;
    imageHint: string;
    coordinates: [number, number];
    organizerId: string;
}

export interface Tutor {
    id: string;
    tutorId: string;
    subject: string;
    level: string;
    pricePerHour: number;
    rating?: number;
    coordinates: [number, number];
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
}
