
'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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

export default function FollowListModal({ title, userIds, onClose }: FollowListModalProps) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const usersQuery = useMemoFirebase(() => {
        if (!firestore || userIds.length === 0) return null;
        // Firestore 'in' queries are limited to 30 elements.
        // For this app, we'll assume the lists are not that long.
        // A production app would need to handle pagination for larger lists.
        return query(collection(firestore, 'users'), where('id', 'in', userIds.slice(0, 30)));
    }, [firestore, userIds]);

    const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

    const getInitials = (name?: string) => {
        if (!name) return '..';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    const handleAction = (userId: string) => {
        const action = title === 'Abonnés' ? "Supprimer l'abonné" : "Ne plus suivre";
        toast({
            title: `Action: ${action}`,
            description: `Logique pour "${action}" l'utilisateur ${userId} à implémenter.`,
        });
    }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6">
            <div className="space-y-2">
                {isLoading && Array.from({length: 3}).map((_, i) => <UserRowSkeleton key={i} />)}
                {!isLoading && users && users.map(user => (
                     <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={user.profilePicture} />
                                <AvatarFallback>{getInitials(user.firstName)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-muted-foreground">{user.university}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleAction(user.id)}>
                            {title === 'Abonnés' ? 'Supprimer' : 'Ne plus suivre'}
                        </Button>
                    </div>
                ))}
                 {!isLoading && (!users || users.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
                        {title === 'Abonnés' ? "Aucun abonné pour le moment." : "Vous ne suivez personne pour le moment."}
                    </p>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    