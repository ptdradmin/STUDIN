
'use client';

import type { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface UserCardProps {
    userProfile: UserProfile;
    isSuggestion?: boolean;
}

export default function UserCard({ userProfile, isSuggestion = false }: UserCardProps) {

    const getInitials = (name?: string) => {
        if (!name) return '??';
        const nameParts = name.split(' ');
        if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
            return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    return (
        <div className="flex items-center justify-between">
            <Link href={`/profile/${userProfile.id}`} className="flex items-center gap-3">
                <Avatar className="h-11 w-11">
                    <AvatarImage src={userProfile.profilePicture} alt={userProfile.username} />
                    <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate">{userProfile.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{userProfile.firstName} {userProfile.lastName}</p>
                </div>
            </Link>
            {isSuggestion ? (
                <Button variant="link" size="sm" className="text-xs p-0 h-auto" asChild>
                    <Link href={`/profile/${userProfile.id}`}>Suivre</Link>
                </Button>
            ) : (
                <Button variant="link" size="sm" className="text-xs p-0 h-auto" asChild>
                    <Link href="/settings">Changer</Link>
                </Button>
            )}
        </div>
    );
}
