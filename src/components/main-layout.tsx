
'use client';

import { useUser } from '@/firebase';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import SocialPageContent from '@/social/page';
import { PageSkeleton } from './page-skeleton';

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
        return <SocialPageContent />;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
