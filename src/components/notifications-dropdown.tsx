
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
import { usePathname } from "next/navigation";


const notifications = [
  { id: 1, user: 'Jeanne', action: 'a aimé votre publication.', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=jeanne', time: '2m' },
  { id: 2, user: 'Pierre', action: 'a commencé à vous suivre.', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=pierre', time: '10m' },
  { id: 3, user: 'Sophie', action: 'a commenté : "Super photo !"', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=sophie', time: '1h' },
  { id: 4, user: 'Marc', action: 'a aimé votre publication.', avatar: 'https://api.dicebear.com/7.x/micah/svg?seed=marc', time: '3h' },
];

export default function NotificationsDropdown() {
    const pathname = usePathname();
    // In a real app, this would be dynamic based on real notifications
    const isActive = false; 

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Bell className={`h-5 w-5 ${isActive ? 'fill-current text-red-500' : ''}`} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} asChild>
                    <Link href="#" className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={notif.avatar} />
                            <AvatarFallback>{notif.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-sm">
                            <span className="font-semibold">{notif.user}</span>
                            <span> {notif.action}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto">{notif.time}</span>
                    </Link>
                </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
