

'use client';

import { useFirestore, useCollection, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo } from 'react';
import { toggleFollowUser } from '@/lib/actions';
import { getInitials } from '@/lib/avatars';

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

function UserRow({ userProfile, currentUserId, isFollowing, onFollowToggle, isUpdating }: { userProfile: UserProfile, currentUserId: string, isFollowing: boolean, onFollowToggle: (targetUserId: string, wasFollowing: boolean) => void, isUpdating: boolean }) {
    const isCurrentUser = userProfile.id === currentUserId;

    const handleFollowClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onFollowToggle(userProfile.id, isFollowing);
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
                 <Button variant={isFollowing ? 'secondary' : 'default'} size="sm" onClick={handleFollowClick} className="ml-4" disabled={isUpdating}>
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
    
    const [localFollowingIds, setLocalFollowingIds] = useState<string[]>([]);
    const [updatingFollow, setUpdatingFollow] = useState<string | null>(null);
    const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { data: currentUser, isLoading: isCurrentUserLoading } = useDoc<UserProfile>(
        useMemo(() => authUser && firestore ? doc(firestore, 'users', authUser.uid) : null, [firestore, authUser])
    );
    
    useEffect(() => {
        if (currentUser?.followingIds) {
            setLocalFollowingIds(currentUser.followingIds);
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!firestore || !userIds || userIds.length === 0) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            const profiles: UserProfile[] = [];
            
            // Firestore 'in' query is limited to 30 items. We need to batch requests.
            const batchSize = 30;
            for (let i = 0; i < userIds.length; i += batchSize) {
                const batchIds = userIds.slice(i, i + batchSize);
                const q = query(collection(firestore, 'users'), where('id', 'in', batchIds));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(doc => {
                    profiles.push(doc.data() as UserProfile);
                });
            }
            
            setUserProfiles(profiles);
            setIsLoading(false);
        }
        
        fetchUsers();
    }, [firestore, userIds]);

    const handleFollowToggle = async (targetUserId: string, wasFollowing: boolean) => {
        if (!authUser || !firestore) {
            toast({ title: "Erreur", description: "Vous devez être connecté.", variant: "destructive"});
            return;
        }

        setUpdatingFollow(targetUserId);

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
        } finally {
            setUpdatingFollow(null);
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
                
                {!isLoading && !isCurrentUserLoading && userProfiles && authUser && (
                   userProfiles.map(u => (
                     <UserRow 
                        key={u.id}
                        userProfile={u}
                        currentUserId={authUser.uid}
                        isFollowing={localFollowingIds.includes(u.id)}
                        onFollowToggle={handleFollowToggle}
                        isUpdating={updatingFollow === u.id}
                     />
                   ))
                )}
                 
                 {!isLoading && (!userProfiles || userProfiles.length === 0) && (
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
