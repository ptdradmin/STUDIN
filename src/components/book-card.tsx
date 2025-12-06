

'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import Image from "next/image";
import type { Book } from "@/lib/types";
import { useUser } from "@/firebase";
import { Badge } from "@/components/ui/badge";

interface BookCardProps {
    book: Book,
    onContact: (sellerId: string) => void
}

export function BookCard({ book, onContact }: BookCardProps) {
    const { user } = useUser();
    const isOwner = user?.uid === book.sellerId;
    return (
        <Card className="overflow-hidden transition-shadow hover:shadow-xl flex flex-col">
            <div className="relative aspect-square w-full">
                <Image src={book.imageUrl} alt={book.title} fill className="object-cover" />
            </div>
            <CardContent className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    <Badge variant="outline">{book.condition}</Badge>
                    <h3 className="text-lg font-bold mt-2 leading-tight">{book.title}</h3>
                    <p className="text-sm text-muted-foreground">de {book.author}</p>
                    {book.university && <p className="text-xs text-muted-foreground mt-1">{book.university}</p>}
                    {book.course && <p className="text-xs text-muted-foreground">{book.course}</p>}
                </div>
                <div className="flex justify-between items-end mt-4 pt-4 border-t">
                    <p className="text-2xl font-bold text-primary">{book.price}€</p>
                    {!isOwner && (
                        <Button size="sm" onClick={() => onContact(book.sellerId)}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Contacter
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

    