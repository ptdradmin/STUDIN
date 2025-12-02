
'use client';

import Link from 'next/link';
import { UserProfile, Housing, Event, Tutor } from '@/lib/types';
import { User, Bed, PartyPopper, BookOpen } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import Image from 'next/image';

type SearchResult = 
    | { type: 'user', data: UserProfile }
    | { type: 'housing', data: Housing }
    | { type: 'event', data: Event }
    | { type: 'tutor', data: Tutor };

interface SearchResultItemProps {
    item: SearchResult;
    onLinkClick?: () => void;
}

const typeConfig = {
    user: { icon: User, getTitle: (d: UserProfile) => d.username, getSubtitle: (d: UserProfile) => `${d.firstName} ${d.lastName}`, getLink: (d: UserProfile) => `/profile/${d.id}` },
    housing: { icon: Bed, getTitle: (d: Housing) => d.title, getSubtitle: (d: Housing) => d.city, getLink: (d: Housing) => `/housing` }, // Simplified link
    event: { icon: PartyPopper, getTitle: (d: Event) => d.title, getSubtitle: (d: Event) => d.city, getLink: (d: Event) => `/events` }, // Simplified link
    tutor: { icon: BookOpen, getTitle: (d: Tutor) => d.subject, getSubtitle: (d: Tutor) => `par ${d.username}`, getLink: (d: Tutor) => `/tutoring/${d.id}` },
};

export default function SearchResultItem({ item, onLinkClick }: SearchResultItemProps) {
    const config = typeConfig[item.type as keyof typeof typeConfig];
    if (!config) return null;

    const Icon = config.icon;
    const title = config.getTitle(item.data as any);
    const subtitle = config.getSubtitle(item.data as any);
    const link = config.getLink(item.data as any);
    const imageUrl = item.type === 'user' ? (item.data as UserProfile).profilePicture : (item.data as any).imageUrl;

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    return (
        <Link href={link} onClick={onLinkClick}>
            <div className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-md">
                <Avatar className="h-10 w-10 rounded-lg">
                    {imageUrl ? <AvatarImage src={imageUrl} className="object-cover" /> : <div className="h-full w-full flex items-center justify-center bg-muted"><Icon className="h-5 w-5 text-muted-foreground"/></div>}
                    <AvatarFallback className="rounded-lg">{getInitials(title)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
            </div>
        </Link>
    );
}
