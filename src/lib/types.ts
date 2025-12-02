

import type { Timestamp } from 'firebase/firestore';

export interface Housing {
  id: string;
  userId: string;
  username: string;
  userAvatarUrl?: string;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Post {
    id: string;
    userId: string;
    username: string;
    userAvatarUrl?: string;
    caption: string;
    imageUrl?: string;
    location?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    likes: string[];
    comments: {
        userId: string;
        username: string;
        userAvatarUrl?: string;
        text: string;
        createdAt: string;
    }[];
}

export interface Reel {
    id: string;
    userId: string;
    username: string;
    userAvatarUrl?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    caption: string;
    createdAt: Timestamp;
    likes: string[];
    comments: {
        userId: string;
        username: string;
        userAvatarUrl?: string;
        text: string;
        createdAt: string;
    }[];
}

export interface Event {
    id: string;
    organizerId: string;
    username: string;
    userAvatarUrl?: string;
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
    createdAt: Timestamp;
    updatedAt: Timestamp;
    university?: string;
    maxAttendees?: number;
    attendeeIds?: string[];
}

export interface Tutor {
    id: string;
    tutorId: string;
    username: string;
    userAvatarUrl?: string;
    subject: string;
    level: string;
    pricePerHour: number;
    rating?: number;
    totalReviews?: number;
    coordinates: [number, number];
    description: string;
    locationType: 'online' | 'in-person' | 'both';
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface TutoringReview {
  id: string;
  tutoringId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}

export interface Trip {
    id: string;
    driverId: string;
    username: string;
    userAvatarUrl?: string;
    departureCity: string;
    arrivalCity: string;
    departureTime: string;
    pricePerSeat: number;
    seatsAvailable: number;
    passengerIds: string[];
    coordinates: [number, number];
    arrivalCoordinates?: [number, number];
    departureAddress: string;
    arrivalAddress: string;
    description: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CarpoolBooking {
  id: string;
  carpoolId: string;
  passengerId: string;
  seatsBooked: number;
  status: string;
  createdAt: Timestamp;
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
    isVerified?: boolean;
    followerIds: string[];
    followingIds: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface ChatMessage {
    id: string;
    text?: string;
    senderId: string;
    createdAt: Timestamp;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    fileType?: 'image' | 'video' | 'audio';
}

export interface Conversation {
    id:string;
    participantIds: string[];
    participants: { [key: string]: { username: string; profilePicture?: string } };
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: Timestamp;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
    unread?: boolean;
}

export interface Notification {
  id: string;
  type: 'new_follower' | 'like' | 'comment' | 'new_message' | 'carpool_booking' | 'event_attendance';
  senderId: string;
  senderProfile: {
      username: string;
      profilePicture: string;
  };
  recipientId: string;
  relatedId?: string;
  message?: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface Favorite {
    id: string;
    userId: string;
    itemId: string;
    itemType: 'post' | 'housing' | 'event' | 'tutor';
    createdAt: Timestamp;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    category: 'Exploration' | 'Social' | 'Créatif' | 'Académique';
    difficulty: 'facile' | 'moyen' | 'difficile';
    points: number;
    imageUrl: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    createdAt: Timestamp;
}
