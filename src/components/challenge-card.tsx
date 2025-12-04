
'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Challenge } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';
import { placeholderImages as PlaceHolderImages } from '@/lib/placeholder-images.json';

interface ChallengeCardProps {
  challenge: Challenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const difficultyMap: {[key: string]: {text: string, color: string}} = {
      facile: { text: "Facile", color: "bg-green-500" },
      moyen: { text: "Moyen", color: "bg-yellow-500" },
      difficile: { text: "Difficile", color: "bg-red-500" },
  };

  const imageHint = PlaceHolderImages.find(p => p.imageUrl === challenge.imageUrl)?.imageHint || 'student challenge';

  return (
    <Link href={`/challenges/${challenge.id}`} className="block h-full group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
        <div className="relative aspect-video">
          <Image
            src={challenge.imageUrl}
            alt={challenge.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={imageHint}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="capitalize text-xs">{challenge.category}</Badge>
          </div>
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-xl font-bold drop-shadow-lg">{challenge.title}</h3>
          </div>
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
          <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
            {challenge.description}
          </p>
          <div className="flex justify-between items-center mt-auto text-sm">
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${difficultyMap[challenge.difficulty]?.color}`}></div>
                <span className="font-medium capitalize">{difficultyMap[challenge.difficulty]?.text}</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold text-lg">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span>{challenge.points}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
