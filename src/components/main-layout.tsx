
'use client';

import { useUser } from '@/firebase';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { PageSkeleton } from './page-skeleton';
import { usePathname } from 'next/navigation';
import SocialLayout from '@/social/layout';

const publicRoutes = ['/login', '/register', '/about', '/who-we-are', '/press', '/terms', '/privacy', '/help', '/contact', '/faq', '/community-rules', '/housing', '/carpooling', '/tutoring', '/events'];

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isUserLoading } = useUser();
    const pathname = usePathname();

    if (isUserLoading) {
        return <PageSkeleton />;
    }

    // If user is logged in, always show the app layout
    if (user) {
        return <SocialLayout>{children}</SocialLayout>;
    }

    // If user is not logged in, show public site
    // This also handles the root path "/" when not logged in
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
