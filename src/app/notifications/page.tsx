
'use client';

import SocialSidebar from "@/components/social-sidebar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Notification } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell } from "lucide-react";
import NotificationsDropdown from "@/components/notifications-dropdown";
import GlobalSearch from "@/components/global-search";
import NotificationCard from "@/components/notification-card";


function PageSkeleton() {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <SocialSidebar />
            <div className="flex flex-col flex-1 p-6">
                <Skeleton className="h-10 w-1/3 mb-10" />
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                         <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-grow space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function NotificationsPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const notificationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, `users/${user.uid}/notifications`),
            orderBy('createdAt', 'desc'),
            limit(50)
        );
    }, [firestore, user?.uid]);

    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);
    
    if (isUserLoading || isLoading) {
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
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-2xl font-bold tracking-tight mb-6">Notifications</h1>

                        <div className="space-y-3">
                             {(!notifications || notifications.length === 0) ? (
                                 <div className="text-center py-20 text-muted-foreground border rounded-lg">
                                    <Bell className="h-16 w-16 mx-auto mb-4" strokeWidth={1}/>
                                    <p className="font-semibold">Rien de neuf pour l'instant</p>
                                    <p className="text-sm">Vos notifications apparaîtront ici.</p>
                                </div>
                             ) : (
                                notifications.map(notif => <NotificationCard key={notif.id} notification={notif} />)
                             )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
