'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Bell, Heart } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Notification } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

function NotificationSkeleton() {
    return (
        <DropdownMenuItem>
             <div className="flex items-center gap-3 w-full animate-pulse">
                <div className="h-9 w-9 rounded-full bg-muted"></div>
                <div className="text-sm space-y-2">
                    <div className="h-3 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-16 bg-muted rounded"></div>
                </div>
            </div>
        </DropdownMenuItem>
    )
}

export default function NotificationsDropdown() {
    const { user } = useUser();
    const firestore = useFirestore();

    const notificationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, `users/${user.uid}/notifications`),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
    }, [firestore, user]);

    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);
    
    const getInitials = (name?: string) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }
    
    const renderNotificationText = (notif: Notification) => {
        switch (notif.type) {
            case 'new_follower':
                return <>a commencé à vous suivre.</>;
            case 'like':
                return <>a aimé votre publication.</>;
            case 'comment':
                return <>a commenté votre publication.</>;
            default:
                return <>vous a envoyé une notification.</>;
        }
    };
    
    // In a real app, this would be dynamic based on `notif.read` status
    const hasUnread = notifications ? notifications.some(n => !n.read) : false; 

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                    <Bell className={`h-5 w-5`} />
                    {hasUnread && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isLoading && Array.from({length: 3}).map((_, i) => <NotificationSkeleton key={i} />)}

                {!isLoading && notifications && notifications.map((notif) => {
                    const timeAgo = notif.createdAt ? formatDistanceToNow(notif.createdAt.toDate(), { addSuffix: true, locale: fr }) : '';
                    return (
                        <DropdownMenuItem key={notif.id} asChild>
                            <Link href={`/profile/${notif.senderId}`} className="flex items-start gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={notif.senderProfile.profilePicture} />
                                    <AvatarFallback>{getInitials(notif.senderProfile.username)}</AvatarFallback>
                                </Avatar>
                                <div className="text-sm flex-grow">
                                    <span className="font-semibold">{notif.senderProfile.username}</span>
                                    <span className="ml-1">{renderNotificationText(notif)}</span>
                                </div>
                                <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{timeAgo}</span>
                            </Link>
                        </DropdownMenuItem>
                    )
                })}
                 {!isLoading && (!notifications || notifications.length === 0) && (
                    <p className="p-4 text-center text-sm text-muted-foreground">Aucune nouvelle notification.</p>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

    