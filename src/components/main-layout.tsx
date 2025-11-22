
'use client';

import { useUser } from '@/firebase';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { PageSkeleton } from './page-skeleton';
import { usePathname } from 'next/navigation';
import SocialLayout from '@/social/layout';

const socialRoutes = ['/social', '/profile', '/settings', '/messages'];

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

    if (user && socialRoutes.includes(pathname)) {
        return <SocialLayout>{children}</SocialLayout>;
    }
    
    if (user && !socialRoutes.includes(pathname)) {
        return (
            <SocialLayout>
                {/* This will render the main social page content if a logged-in user lands on a public route */}
            </SocialLayout>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
}
