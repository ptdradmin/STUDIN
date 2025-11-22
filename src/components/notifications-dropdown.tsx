
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
import { Heart } from "lucide-react";
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
                <Button 
                    variant="ghost" 
                    size="lg" 
                    aria-label="Notifications" 
                    className="justify-center lg:justify-start items-center gap-4 h-12 w-12 lg:w-full"
                >
                    <Heart className={`h-6 w-6 ${isActive ? 'fill-current text-red-500' : ''}`} />
                    <span className={`hidden lg:inline text-base ${isActive ? 'font-bold' : 'font-normal'}`}>Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                    {notifications.map(notif => (
                        <DropdownMenuItem key={notif.id} asChild>
                            <Link href="#" className="flex items-start gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={notif.avatar} />
                                    <AvatarFallback>{notif.user[0]}</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    <span className="font-semibold">{notif.user}</span>
                                    <span className="text-muted-foreground ml-1">{notif.action}</span>
                                    <p className="text-xs text-muted-foreground">{notif.time}</p>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                     {notifications.length === 0 && (
                        <p className="p-4 text-sm text-center text-muted-foreground">Aucune nouvelle notification</p>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
