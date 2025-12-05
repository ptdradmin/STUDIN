
import type { Timestamp } from 'firebase/firestore';

export type Housing = {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'kot' | 'studio' | 'colocation';
  price: number;
  address: string;
  city: string;
  bedrooms: number;
  surfaceArea: number;
  imageUrl: string;
  imageHint: string;
  coordinates: [number, number];
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Post = {
    id: string;
    userId: string;
    username: string;
    userAvatarUrl?: string;
    caption: string;
    imageUrl?: string;
    videoUrl?: string;
    fileType?: 'image' | 'video';
    location?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    likes: string[];
    comments: {
        userId: string;
        username: string;
        userAvatarUrl?: string;
        text: string;
        createdAt: Timestamp;
    }[];
    isUploading?: boolean;
    uploadError?: boolean;
    songTitle?: string;
    audioUrl?: string;
};

export type Reel = {
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
        createdAt: Timestamp;
    }[];
    songTitle?: string;
    audioUrl?: string;
};

export type Event = {
    id: string;
    organizerId: string;
    title: string;
    description: string;
    category: 'soirée' | 'conférence' | 'sport' | 'culture';
    startDate: Timestamp;
    endDate: Timestamp;
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
};

export type Tutor = {
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
};

export type TutoringReview = {
  id: string;
  tutoringId: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
};

export type Trip = {
    id: string;
    driverId: string;
    departureCity: string;
    arrivalCity: string;
    departureTime: Timestamp;
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
};

export interface Book {
    id: string;
    title: string;
    author: string;
    description?: string;
    condition: 'Neuf' | 'Très bon' | 'Bon' | 'Acceptable';
    price: number;
    imageUrl: string;
    sellerId: string;
    sellerName: string;
    sellerAvatarUrl?: string;
    course?: string;
    university?: string;
    createdAt: Timestamp;
}

export type CarpoolBooking = {
  id: string;
  carpoolId: string;
  passengerId: string;
  seatsBooked: number;
  status: string;
  createdAt: Timestamp;
};

export type UserProfile = {
    id: string;
    role: 'student' | 'institution' | 'admin';
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
    isPro?: boolean;
    followerIds: string[];
    followingIds: string[];
    points?: number;
    challengesCompleted?: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type ChatMessage = {
    id: string;
    senderId: string;
    createdAt: Timestamp;
    role: 'user' | 'model';
    text?: string;
    imageUrl?: string;
    audioUrl?: string;
    fileUrl?: string;
    fileType?: string;
    toolData?: any;
};

export type Conversation = {
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
};

export type Notification = {
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
};

export type Favorite = {
    id: string;
    userId: string;
    itemId: string;
    itemType: 'post' | 'housing' | 'event' | 'tutor' | 'book';
    createdAt: Timestamp;
};

export type Challenge = {
    id: string;
    creatorId: string;
    title: string;
    description: string;
    category: 'Exploration' | 'Social' | 'Créatif' | 'Académique' | 'Environnement' | 'Sportif';
    difficulty: 'facile' | 'moyen' | 'difficile';
    points: number;
    imageUrl: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    createdAt: Timestamp;
};

export type ChallengeSubmission = {
    id: string;
    challengeId: string;
    userId: string;
    userProfile: {
        username: string;
        avatarUrl: string;
    };
    proofUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Timestamp;
};
