
'use client';

import { useFirestore, useMemoFirebase, useCollection, useUser } from '@/firebase';
import { collection, query, where, doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
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

function UserRow({ userProfile, currentUser, firestore, onAction, currentUserId }: { userProfile: UserProfile, currentUser: UserProfile | null, firestore: any, onAction: any, currentUserId: string}) {
    const isCurrentUser = userProfile.id === currentUserId;
    const isFollowing = currentUser?.followingIds?.includes(userProfile.id);
    const { toast } = useToast();

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUser) {
            toast({ title: "Erreur", description: "Vous devez être connecté.", variant: "destructive"});
            return;
        }
        await toggleFollowUser(firestore, currentUser.id, userProfile.id, isFollowing || false);
        toast({ title: isFollowing ? "Ne plus suivre" : "Suivi" });
        onAction(); // To trigger a re-render/refetch in parent if needed
    }

    const getInitials = (name?: string) => {
        if (!name) return '..';
        return name.split(' ').map(n => n[0]).join('');
    }

    return (
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
            <Link href={`/profile/${userProfile.id}`} className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={userProfile.profilePicture} />
                    <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-sm">{userProfile.username}</p>
                    <p className="text-xs text-muted-foreground">{userProfile.firstName} {userProfile.lastName}</p>
                </div>
            </Link>
            {!isCurrentUser && currentUser && (
                 <Button variant={isFollowing ? 'secondary' : 'default'} size="sm" onClick={handleFollowToggle}>
                    {isFollowing ? 'Abonné(e)' : 'Suivre'}
                </Button>
            )}
        </div>
    )
}

export default function FollowListModal({ title, userIds, onClose }: FollowListModalProps) {
    const firestore = useFirestore();
    const { user: authUser } = useUser();
    const [_, setForceRender] = useState(0); // Helper to force re-render

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
                {(isLoading || isCurrentUserLoading) && Array.from({length: 3}).map((_, i) => <UserRowSkeleton key={i} />)}
                
                {!isLoading && !isCurrentUserLoading && users && authUser && (
                   users.map(u => (
                     <UserRow 
                        key={u.id}
                        userProfile={u}
                        currentUser={currentUser}
                        firestore={firestore}
                        onAction={() => setForceRender(c => c + 1)}
                        currentUserId={authUser.uid}
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

    