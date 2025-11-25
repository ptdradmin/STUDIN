

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
  ownerUsername: string;
  ownerAvatarUrl?: string;
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
    createdAt: any;
    likes: string[];
    comments: {
        userId: string;
        userDisplayName: string;
        userAvatarUrl?: string;
        text: string;
        createdAt: string;
    }[];
}

export interface Reel {
    id: string;
    videoUrl: string;
    thumbnailUrl?: string;
    caption: string;
    userId: string;
    userDisplayName: string;
    userAvatarUrl?: string;
    createdAt: any;
    likes: string[];
    comments: {
        userId: string;
        userDisplayName: string;
        userAvatarUrl?: string;
        text: string;
        createdAt: string;
    }[];
}

export interface Event {
    id: string;
    organizerId: string;
    organizerUsername: string;
    organizerAvatarUrl?: string;
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
    university?: string;
}

export interface Tutor {
    id: string;
    tutorId: string;
    tutorUsername: string;
    tutorAvatarUrl?: string;
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
    driverUsername: string;
    driverAvatarUrl?: string;
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
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    university: string;
    fieldOfStudy: string;
    postalCode: string;
    city: string;
    bio: string;
    website?: string;
    gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
    profilePicture: string;
    followerIds?: string[];
    followingIds?: string[];
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
    participants: { [key: string]: { username: string; profilePicture?: string } };
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: any;
    };
    createdAt: any;
    updatedAt: any;
}

export interface Notification {
  id: string;
  type: 'new_follower' | 'like' | 'comment';
  senderId: string;
  senderProfile: {
      username: string;
      profilePicture: string;
  };
  recipientId: string;
  postId?: string;
  read: boolean;
  createdAt: any;
}

export interface Favorite {
    id: string;
    userId: string;
    itemId: string;
    itemType: 'post' | 'housing' | 'event' | 'tutor';
    createdAt: any;
}

    