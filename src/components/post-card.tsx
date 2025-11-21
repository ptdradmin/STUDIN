import Image from "next/image";
import type { Post } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Send } from "lucide-react";

interface PostCardProps {
    post: Post;
}

export default function PostCard({ post }: PostCardProps) {
    return (
        <Card className="rounded-none md:rounded-lg border-x-0 md:border-x">
            <CardHeader className="p-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={post.user.avatarUrl} alt={post.user.name} />
                        <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm">{post.user.name}</span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="relative aspect-square">
                    <Image
                        src={post.imageUrl}
                        alt={`Post by ${post.user.name}`}
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
                <p className="font-semibold text-sm mt-2">{post.likes} J'aime</p>
                <div className="text-sm mt-1">
                    <span className="font-semibold">{post.user.name}</span>
                    <span className="ml-2">{post.caption}</span>
                </div>
                 <p className="text-muted-foreground text-xs mt-2 uppercase">
                    Voir les {post.comments.length} commentaires
                </p>
            </CardFooter>
        </Card>
    );
}