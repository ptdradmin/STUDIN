
'use client';

import { useUser } from '@/firebase';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { PageSkeleton } from './page-skeleton';
import { usePathname } from 'next/navigation';
import SocialLayout from '@/social/layout';

const publicRoutes = ['/login', '/register', '/about', '/who-we-are', '/press', '/terms', '/privacy', '/help', '/contact', '/faq', '/community-rules'];

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

    // If user is logged in, show the app layout (SocialLayout) for all pages.
    if (user) {
        return <SocialLayout>{children}</SocialLayout>;
    }

    // If user is not logged in, show public site with Navbar and Footer
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
