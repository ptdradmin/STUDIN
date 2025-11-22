
'use client';

import { useUser } from '@/firebase';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { PageSkeleton } from './page-skeleton';
import SocialLayout from '@/social/layout';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isUserLoading } = useUser();
    
    if (isUserLoading) {
        return <PageSkeleton />;
    }

    if (user) {
        return <SocialLayout>{children}</SocialLayout>;
    }

    return (
        <div className="flex flex-col min-h-screen dark:bg-background">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
