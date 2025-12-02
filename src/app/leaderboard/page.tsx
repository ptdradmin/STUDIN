
'use client';

import * as React from 'react';
import SocialSidebar from '@/components/social-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Trophy } from 'lucide-react';
import GlobalSearch from '@/components/global-search';
import NotificationsDropdown from '@/components/notifications-dropdown';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import Image from 'next/image';

const staticLeaderboard = [
  { rank: 1, userId: 'user1', username: 'Eva', points: 1250, challengesCompleted: 25, avatar: `https://api.dicebear.com/7.x/micah/svg?seed=eva` },
  { rank: 2, userId: 'user2', username: 'Leo', points: 1100, challengesCompleted: 22, avatar: `https://api.dicebear.com/7.x/micah/svg?seed=leo` },
  { rank: 3, userId: 'user3', username: 'Chloe', points: 980, challengesCompleted: 20, avatar: `https://api.dicebear.com/7.x/micah/svg?seed=chloe` },
  { rank: 4, userId: 'user4', username: 'Arthur', points: 850, challengesCompleted: 18, avatar: `https://api.dicebear.com/7.x/micah/svg?seed=arthur` },
  { rank: 5, userId: 'user5', username: 'Juliette', points: 760, challengesCompleted: 15, avatar: `https://api.dicebear.com/7.x/micah/svg?seed=juliette` },
  { rank: 6, userId: 'user6', username: 'Thomas', points: 640, challengesCompleted: 12, avatar: `https://api.dicebear.com/7.x/micah/svg?seed=thomas` },
  { rank: 7, userId: 'user7', username: 'Manon', points: 520, challengesCompleted: 10, avatar: `https://api.dicebear.com/7.x/micah/svg?seed=manon` },
  { rank: 8, userId: 'user_current', username: 'Vous', points: 410, challengesCompleted: 8, avatar: `https://api.dicebear.com/7.x/micah/svg?seed=you` },
];

const PodiumCard = ({ user, rank }: { user: typeof staticLeaderboard[0], rank: number }) => {
  const rankColors = {
    1: 'from-amber-400 to-yellow-500',
    2: 'from-slate-300 to-gray-400',
    3: 'from-amber-600 to-orange-700',
  };
  const rankTrophy = {
    1: '/gold-trophy.png',
    2: '/silver-trophy.png',
    3: '/bronze-trophy.png',
  }

  return (
    <div className={`relative flex flex-col items-center rounded-xl p-6 bg-gradient-to-br ${rankColors[rank as keyof typeof rankColors]} text-white shadow-lg`}>
        <div className="absolute -top-8">
             <Trophy className={`h-12 w-12 drop-shadow-lg ${rank === 1 ? 'text-yellow-300' : rank === 2 ? 'text-gray-200' : 'text-orange-400'}`} />
        </div>
        <Avatar className="h-20 w-20 border-4 border-white/50 mt-4">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.username.substring(0,2)}</AvatarFallback>
        </Avatar>
        <p className="font-bold text-xl mt-3 drop-shadow-sm">{user.username}</p>
        <p className="font-extrabold text-2xl drop-shadow-md">{user.points} pts</p>
    </div>
  );
};


export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = React.useState(staticLeaderboard);
    const topThree = leaderboard.slice(0, 3);
    const restOfBoard = leaderboard.slice(3);
    const currentUser = leaderboard.find(u => u.userId === 'user_current');

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex flex-col flex-1">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="hidden md:flex flex-1 max-w-md items-center">
                        <GlobalSearch />
                    </div>
                    <div className="flex-1 md:hidden">
                        <Button variant="ghost" size="icon"><Search className="h-6 w-6" /></Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <NotificationsDropdown />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-3">
                                <Trophy className="h-8 w-8 text-primary" />
                                Classement UrbanQuest
                            </h1>
                            <p className="text-muted-foreground mt-1">Qui sont les maîtres de la ville ?</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 mb-10 mt-16">
                            {topThree[1] && <div className="md:mt-6"><PodiumCard user={topThree[1]} rank={2} /></div>}
                            {topThree[0] && <div><PodiumCard user={topThree[0]} rank={1} /></div>}
                            {topThree[2] && <div className="md:mt-6"><PodiumCard user={topThree[2]} rank={3} /></div>}
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16 text-center">Rang</TableHead>
                                            <TableHead>Utilisateur</TableHead>
                                            <TableHead className="text-right">Défis</TableHead>
                                            <TableHead className="text-right">Points</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {restOfBoard.map(user => (
                                            <TableRow key={user.userId}>
                                                <TableCell className="font-bold text-center text-muted-foreground">{user.rank}</TableCell>
                                                <TableCell>
                                                     <Link href={`/profile/${user.userId}`} className="flex items-center gap-3 group">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={user.avatar} />
                                                            <AvatarFallback>{user.username.substring(0,2)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium group-hover:text-primary transition-colors">{user.username}</span>
                                                     </Link>
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">{user.challengesCompleted}</TableCell>
                                                <TableCell className="text-right font-bold">{user.points}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                {currentUser && (
                    <footer className="sticky bottom-0 bg-secondary/95 backdrop-blur border-t p-3">
                         <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold w-10 text-center">{currentUser.rank}</span>
                                     <Avatar className="h-9 w-9">
                                        <AvatarImage src={currentUser.avatar} />
                                        <AvatarFallback>{currentUser.username.substring(0,2)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-bold">Vous</span>
                                </div>
                                <div className="font-bold text-primary">{currentUser.points} pts</div>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
}
