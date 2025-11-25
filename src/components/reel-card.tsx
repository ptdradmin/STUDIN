
'use client';

import type { Reel } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Heart, MessageCircle, Send, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useUser } from "@/firebase";
import Link from "next/link";

interface ReelCardProps {
    reel: Reel;
}

export default function ReelCard({ reel }: ReelCardProps) {
    const { user } = useUser();
    const [isLiked, setIsLiked] = useState(user ? reel.likes.includes(user.uid) : false);
    const [likeCount, setLikeCount] = useState(reel.likes.length);

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('');
    };
    
    const handleLike = () => {
        // TODO: Implement actual Firestore logic
        if (isLiked) {
            setLikeCount(prev => prev - 1);
        } else {
            setLikeCount(prev => prev + 1);
        }
        setIsLiked(!isLiked);
    }

    return (
        <div className="relative h-full w-full max-w-sm aspect-[9/16] rounded-2xl overflow-hidden bg-background shadow-lg">
            {/* For now, we use an Image component as a placeholder for the video */}
            <Image
                src={reel.videoUrl}
                alt={reel.caption}
                fill
                className="object-cover"
                unoptimized // Since it's a placeholder
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white flex justify-between items-end">
                <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-2">
                        <Link href={`/profile/${reel.userId}`}>
                           <Avatar className="h-9 w-9 border-2 border-white">
                                <AvatarImage src={reel.userAvatarUrl} />
                                <AvatarFallback>{getInitials(reel.userDisplayName)}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <Link href={`/profile/${reel.userId}`}>
                            <p className="font-semibold text-sm drop-shadow">{reel.userDisplayName}</p>
                        </Link>
                    </div>
                    <p className="text-sm drop-shadow">{reel.caption}</p>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                    <Button variant="ghost" size="icon" className="text-white h-12 w-12" onClick={handleLike}>
                        <div className="flex flex-col items-center">
                            <Heart className={`h-7 w-7 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
                            <span className="text-xs font-semibold">{likeCount}</span>
                        </div>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white h-12 w-12">
                        <div className="flex flex-col items-center">
                            <MessageCircle className="h-7 w-7" />
                            <span className="text-xs font-semibold">{reel.comments.length}</span>
                        </div>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white h-12 w-12">
                         <Send className="h-7 w-7" />
                    </Button>
                     <Button variant="ghost" size="icon" className="text-white h-12 w-12">
                         <MoreHorizontal className="h-7 w-7" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
