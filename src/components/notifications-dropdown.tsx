

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
import { Bell, Heart, Car, MessageSquare, CalendarCheck2, User } from "lucide-react";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, doc, writeBatch } from "firebase/firestore";
import type { Notification } from "@/lib/types";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useMemo } from "react";
import { getInitials } from "@/lib/avatars";

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

    const notificationsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, `users/${user.uid}/notifications`),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
    }, [firestore, user?.uid]);

    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);
    
    const renderNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'new_follower': return <Avatar className="h-7 w-7"><User className="h-4 w-4" /></Avatar>;
            case 'like': return <Heart className="h-5 w-5 text-red-500 fill-red-500" />;
            case 'comment': return <MessageSquare className="h-5 w-5 text-blue-500" />;
            case 'new_message': return <MessageSquare className="h-5 w-5 text-green-500" />;
            case 'carpool_booking': return <Car className="h-5 w-5 text-purple-500" />;
            case 'event_attendance': return <CalendarCheck2 className="h-5 w-5 text-orange-500" />;
            default: return <Bell className="h-5 w-5" />;
        }
    }
    
    const getNotificationLink = (notif: Notification) => {
        switch (notif.type) {
            case 'new_follower': return `/profile/${notif.senderId}`;
            case 'like':
            case 'comment': return `/post/${notif.relatedId}`; // Assuming you'll have a post detail page
            case 'new_message': return `/messages/${notif.relatedId}`;
            case 'carpool_booking': return `/carpooling`; // Or a specific trip page
            case 'event_attendance': return `/events`; // Or a specific event page
            default: return '#';
        }
    }
    
    const handleMarkAsRead = async () => {
        if (!firestore || !user || !notifications) return;
        const batch = writeBatch(firestore);
        notifications.forEach(notif => {
            if (!notif.read) {
                const notifRef = doc(firestore, `users/${user.uid}/notifications`, notif.id);
                batch.update(notifRef, { read: true });
            }
        });
        await batch.commit();
    }

    const hasUnread = notifications ? notifications.some(n => !n.read) : false; 

    return (
        <DropdownMenu onOpenChange={(open) => open && hasUnread && handleMarkAsRead()}>
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
                        <DropdownMenuItem key={notif.id} asChild className={!notif.read ? 'bg-primary/10' : ''}>
                            <Link href={getNotificationLink(notif)} className="flex items-start gap-3">
                                <div className="mt-1">{renderNotificationIcon(notif.type)}</div>
                                <div className="text-sm flex-grow">
                                    <p>
                                        <span className="font-semibold">{notif.senderProfile.username}</span>
                                        <span className="ml-1">{notif.message}</span>
                                    </p>
                                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                                </div>
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
