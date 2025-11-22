

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
    category: string;
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
