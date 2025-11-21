import Image from "next/image";
import type { Housing } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Home, MapPin } from "lucide-react";

interface HousingCardProps {
    housing: Housing;
}

export default function HousingCard({ housing }: HousingCardProps) {
    return (
        <Card className="overflow-hidden shadow-md transition-shadow hover:shadow-xl flex flex-col h-full">
            <div className="relative">
                <Image
                    src={housing.image.url}
                    alt={housing.title}
                    width={600}
                    height={400}
                    className="aspect-[3/2] w-full object-cover"
                    data-ai-hint={housing.image.hint}
                />
                <Badge variant="secondary" className="absolute top-2 right-2 capitalize bg-white/80 text-foreground hover:bg-white">
                    {housing.type}
                </Badge>
            </div>
            <CardContent className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold leading-tight truncate">{housing.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    {housing.city}
                </p>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-grow">{housing.description}</p>
                
                <div className="flex items-center text-sm text-muted-foreground gap-4 mt-3">
                    <span className="flex items-center"><Bed className="h-4 w-4 mr-1"/> {housing.bedrooms} ch.</span>
                    <span className="flex items-center"><Home className="h-4 w-4 mr-1"/> {housing.surface_area}m²</span>
                </div>

                <div className="flex items-end justify-between mt-4 pt-4 border-t">
                    <div>
                        <p className="text-2xl font-bold text-primary">{housing.price}€</p>
                        <p className="text-xs text-muted-foreground -mt-1">/mois</p>
                    </div>
                    <Button>Contacter</Button>
                </div>
            </CardContent>
        </Card>
    );
}
