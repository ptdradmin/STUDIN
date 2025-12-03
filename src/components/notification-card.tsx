
'use client';

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { Notification } from "@/lib/types";
import { Heart, Car, MessageSquare, CalendarCheck2, User, Bell } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface NotificationCardProps {
    notification: Notification;
}

export default function NotificationCard({ notification }: NotificationCardProps) {
    
    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    const renderNotificationIcon = () => {
        const iconBaseClasses = "h-5 w-5";
        switch (notification.type) {
            case 'new_follower': return <User className={cn(iconBaseClasses, "text-blue-500")} />;
            case 'like': return <Heart className={cn(iconBaseClasses, "text-red-500")} />;
            case 'comment': return <MessageSquare className={cn(iconBaseClasses, "text-sky-500")} />;
            case 'new_message': return <MessageSquare className={cn(iconBaseClasses, "text-green-500")} />;
            case 'carpool_booking': return <Car className={cn(iconBaseClasses, "text-purple-500")} />;
            case 'event_attendance': return <CalendarCheck2 className={cn(iconBaseClasses, "text-orange-500")} />;
            default: return <Bell className={cn(iconBaseClasses)} />;
        }
    };

    const getNotificationLink = () => {
        switch (notification.type) {
            case 'new_follower': return `/profile/${notification.senderId}`;
            case 'like':
            case 'comment': return `/post/${notification.relatedId}`;
            case 'new_message': return `/messages/${notification.relatedId}`;
            case 'carpool_booking': return `/carpooling`;
            case 'event_attendance': return `/events`;
            default: return '#';
        }
    };

    const timeAgo = notification.createdAt ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true, locale: fr }) : '';

    return (
        <Link href={getNotificationLink()}>
            <div className={cn("flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors border", !notification.read && "bg-primary/5")}>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.senderProfile.profilePicture} />
                    <AvatarFallback>{getInitials(notification.senderProfile.username)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <p className="text-sm">
                        <span className="font-semibold">{notification.senderProfile.username}</span>
                        <span className="ml-1 text-muted-foreground">{notification.message}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                </div>
                 <div className="flex-shrink-0 self-center">
                    {renderNotificationIcon()}
                </div>
            </div>
        </Link>
    );
}
