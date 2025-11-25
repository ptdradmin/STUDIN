
'use client';

import { useFirestore, useMemoFirebase, useCollection, useUser } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { toggleFollowUser } from '@/lib/actions';

interface FollowListModalProps {
  title: string;
  userIds: string[];
  onClose: () => void;
}

function UserRowSkeleton() {
    return (
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="h-9 w-24" />
        </div>
    )
}

function UserRow({ userProfile, currentUserId, isFollowing, onFollowToggle }: { userProfile: UserProfile, currentUserId: string, isFollowing: boolean, onFollowToggle: (targetUserId: string, wasFollowing: boolean) => void }) {
    const isCurrentUser = userProfile.id === currentUserId;

    const handleFollowClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onFollowToggle(userProfile.id, isFollowing);
    }

    const getInitials = (name?: string) => {
        if (!name) return '..';
        return name.split(' ').map(n => n[0]).join('');
    }

    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
            <Link href={`/profile/${userProfile.id}`} className="flex items-center gap-3 flex-grow">
                <Avatar>
                    <AvatarImage src={userProfile.profilePicture} />
                    <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">{userProfile.username}</p>
                    <p className="text-xs text-muted-foreground">{userProfile.firstName} {userProfile.lastName}</p>
                </div>
            </Link>
            {!isCurrentUser && (
                 <Button variant={isFollowing ? 'secondary' : 'default'} size="sm" onClick={handleFollowClick} className="ml-4">
                    {isFollowing ? 'Abonné(e)' : 'Suivre'}
                </Button>
            )}
        </div>
    )
}

export default function FollowListModal({ title, userIds, onClose }: FollowListModalProps) {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    const { toast } = useToast();
    
    // Local state to manage following status optimistically
    const [localFollowingIds, setLocalFollowingIds] = useState<string[]>([]);
    
    const usersQuery = useMemoFirebase(() => {
        if (!firestore || !userIds || userIds.length === 0) return null;
        const safeUserIds = userIds.length > 30 ? userIds.slice(0, 30) : userIds;
        return query(collection(firestore, 'users'), where('id', 'in', safeUserIds));
    }, [firestore, userIds]);

    const currentUserRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return doc(firestore, 'users', authUser.uid);
    }, [firestore, authUser]);

    const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);
    const { data: currentUser, isLoading: isCurrentUserLoading } = useDoc<UserProfile>(currentUserRef);
    
    useState(() => {
        if (currentUser?.followingIds) {
            setLocalFollowingIds(currentUser.followingIds);
        }
    });

    const handleFollowToggle = async (targetUserId: string, wasFollowing: boolean) => {
        if (!authUser || !firestore) {
            toast({ title: "Erreur", description: "Vous devez être connecté.", variant: "destructive"});
            return;
        }

        // Optimistic update
        if (wasFollowing) {
            setLocalFollowingIds(prev => prev.filter(id => id !== targetUserId));
        } else {
            setLocalFollowingIds(prev => [...prev, targetUserId]);
        }

        try {
            await toggleFollowUser(firestore, authUser.uid, targetUserId, wasFollowing);
            toast({ title: wasFollowing ? "Ne plus suivre" : "Suivi" });
        } catch (error) {
            // Revert optimistic update on error
             if (wasFollowing) {
                setLocalFollowingIds(prev => [...prev, targetUserId]);
            } else {
                setLocalFollowingIds(prev => prev.filter(id => id !== targetUserId));
            }
            toast({ title: "Erreur", description: "L'action a échoué.", variant: "destructive" });
        }
    }
    
    if (!userIds || userIds.length === 0) {
        return (
             <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
                    <p className="text-center text-muted-foreground py-8">
                       {title === 'Abonnés' ? "Aucun abonné pour le moment." : "Ne suit personne pour le moment."}
                    </p>
                </DialogContent>
            </Dialog>
        )
    }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6">
            <div className="space-y-1">
                {(isLoading || isCurrentUserLoading) && Array.from({length: Math.min(userIds.length, 3)}).map((_, i) => <UserRowSkeleton key={i} />)}
                
                {!isLoading && !isCurrentUserLoading && users && authUser && (
                   users.map(u => (
                     <UserRow 
                        key={u.id}
                        userProfile={u}
                        currentUserId={authUser.uid}
                        isFollowing={currentUser?.followingIds?.includes(u.id) || false}
                        onFollowToggle={handleFollowToggle}
                     />
                   ))
                )}
                 
                 {!isLoading && (!users || users.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
                        {title === 'Abonnés' ? "Aucun abonné pour le moment." : "Ne suit personne pour le moment."}
                    </p>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    