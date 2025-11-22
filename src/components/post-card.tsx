import Image from "next/image";
import type { Post } from "@/lib/types";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Send } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    const getInitials = (name: string) => {
        const parts = name.split(' ');
        if (parts.length > 1) {
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    const timeAgo = post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr }) : '';

    return (
        <Card className="rounded-none md:rounded-lg border-x-0 md:border-x">
            <CardHeader className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={post.userAvatarUrl} alt={post.userDisplayName} />
                            <AvatarFallback>{getInitials(post.userDisplayName)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{post.userDisplayName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative aspect-square">
                    <Image
                        src={post.imageUrl}
                        alt={`Post by ${post.userDisplayName}`}
                        fill
                        className="object-cover"
                        data-ai-hint="social media post"
                    />
                </div>
            </CardContent>
            <CardFooter className="p-3 flex flex-col items-start">
                <div className="flex items-center gap-2 -ml-2">
                    <Button variant="ghost" size="icon"><Heart className="h-6 w-6" /></Button>
                    <Button variant="ghost" size="icon"><MessageCircle className="h-6 w-6" /></Button>
                    <Button variant="ghost" size="icon"><Send className="h-6 w-6" /></Button>
                </div>
                <p className="font-semibold text-sm mt-2">{post.likes || 0} J'aime</p>
                <div className="text-sm mt-1">
                    <span className="font-semibold">{post.userDisplayName}</span>
                    <span className="ml-2">{post.caption}</span>
                </div>
                 <p className="text-muted-foreground text-xs mt-2 uppercase">
                    Voir les {post.comments?.length || 0} commentaires
                </p>
            </CardFooter>
        </Card>
    );
}
