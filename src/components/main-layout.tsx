
'use client';

import { useUser } from '@/firebase';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { PageSkeleton } from './page-skeleton';
import SocialLayout from '@/social/layout';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const publicPages = ['/', '/about', '/contact', '/login', '/register', '/faq', '/terms', '/privacy', '/community-rules', '/help', '/press', '/who-we-are'];

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isUserLoading } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && user && publicPages.includes(pathname)) {
            router.replace('/social');
        }
    }, [user, isUserLoading, pathname, router]);
    
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
