

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


export interface PlaceholderData {
    events: Event[];
    tutors: Tutor[];
    trips: Trip[];
}
