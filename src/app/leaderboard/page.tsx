

'use client';

import * as React from 'react';
import SocialSidebar from '@/components/social-sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Loader2 } from 'lucide-react';
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
import { useDoc, useFirestore, useUser, useCollection } from '@/firebase';
import { UserProfile } from '@/lib/types';
import { doc, collection, query, orderBy, limit, where } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

const PodiumCard = ({ user, rank }: { user: UserProfile, rank: number }) => {
    const rankColors: { [key: number]: string } = {
        1: 'from-amber-400 to-yellow-500',
        2: 'from-slate-300 to-gray-400',
        3: 'from-amber-600 to-orange-700',
    };

    return (
        <div className={`relative flex flex-col items-center rounded-xl p-6 bg-gradient-to-br ${rankColors[rank]} text-white shadow-lg`}>
            <div className="absolute -top-8">
                <Trophy className={`h-12 w-12 drop-shadow-lg ${rank === 1 ? 'text-yellow-300' : rank === 2 ? 'text-gray-200' : 'text-orange-400'}`} />
            </div>
            <Avatar className="h-20 w-20 border-4 border-white/50 mt-4">
                <AvatarImage src={user.profilePicture} />
                <AvatarFallback>{user.username.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <p className="font-bold text-xl mt-3 drop-shadow-sm">{user.username}</p>
            <p className="font-extrabold text-2xl drop-shadow-md">{user.points || 0} pts</p>
        </div>
    );
};

function PageSkeleton() {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex flex-col flex-1 p-6">
                <Skeleton className="h-10 w-1/3 mx-auto mb-10" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 mb-10 mt-16">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-56 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        </div>
    )
}

export default function LeaderboardPage() {
    const { user: authUser, isUserLoading } = useUser();
    const firestore = useFirestore();

    const usersQuery = React.useMemo(() => !firestore ? null : query(collection(firestore, 'users'), where('role', '==', 'student'), orderBy('points', 'desc'), limit(50)), [firestore]);
    const { data: leaderboardData, isLoading: areUsersLoading } = useCollection<UserProfile>(usersQuery);

    const userProfileRef = React.useMemo(() => {
        if (!authUser || !firestore) return null;
        return doc(firestore, 'users', authUser.uid);
    }, [authUser, firestore]);
    const { data: userProfile, isLoading: profileLoading } = useDoc<UserProfile>(userProfileRef);

    const isPartner = userProfile?.role === 'institution' || userProfile?.role === 'admin';
    const topThree = leaderboardData?.slice(0, 3) || [];
    const restOfBoard = leaderboardData?.slice(3) || [];
    const currentUserRanking = leaderboardData?.findIndex(u => u.id === authUser?.uid);

    if (profileLoading || isUserLoading || areUsersLoading) {
        return <PageSkeleton />;
    }

    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex flex-col flex-1">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex-1 max-w-md">
                        <GlobalSearch />
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
                                {isPartner ? "Classement des défis" : "Classement des Défis"}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {isPartner ? "Analysez la participation à vos défis." : "Qui sont les maîtres de la ville ?"}
                            </p>
                        </div>

                        {isPartner && (
                            <Card className="mb-6">
                                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 items-end">
                                    <div>
                                        <Label htmlFor="challenge-filter">Défi</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Tous vos défis" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tous vos défis</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="category-filter">Catégorie</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Toutes" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Toutes</SelectItem>
                                                <SelectItem value="Exploration">Exploration</SelectItem>
                                                <SelectItem value="Créatif">Créatif</SelectItem>
                                                <SelectItem value="Social">Social</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="period-filter">Période</Label>
                                        <Select>
                                            <SelectTrigger><SelectValue placeholder="Depuis le début" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all-time">Depuis le début</SelectItem>
                                                <SelectItem value="monthly">Ce mois-ci</SelectItem>
                                                <SelectItem value="weekly">Cette semaine</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

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
                                        {restOfBoard.map((user, index) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-bold text-center text-muted-foreground">{index + 4}</TableCell>
                                                <TableCell>
                                                    <Link href={`/profile/${user.id}`} className="flex items-center gap-3 group">
                                                        <Avatar className="h-9 w-9">
                                                            <AvatarImage src={user.profilePicture} />
                                                            <AvatarFallback>{user.username.substring(0, 2)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-medium group-hover:text-primary transition-colors">{user.username}</span>
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground">{user.challengesCompleted || 0}</TableCell>
                                                <TableCell className="text-right font-bold">{user.points || 0}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                {currentUserRanking !== undefined && currentUserRanking > -1 && !isPartner && leaderboardData && (
                    <footer className="sticky bottom-16 md:bottom-0 bg-secondary/95 backdrop-blur border-t p-3">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold w-10 text-center">{currentUserRanking + 1}</span>
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={leaderboardData[currentUserRanking].profilePicture} />
                                        <AvatarFallback>{leaderboardData[currentUserRanking].username.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-bold">Vous</span>
                                </div>
                                <div className="font-bold text-primary">{leaderboardData[currentUserRanking].points || 0} pts</div>
                            </div>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
}
