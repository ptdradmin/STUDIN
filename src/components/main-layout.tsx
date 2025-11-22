
'use client';

import { useUser } from '@/firebase';
import SocialLayout from '@/social/layout';
import Navbar from './navbar';
import Footer from './footer';
import { usePathname } from 'next/navigation';
import { PageSkeleton } from './page-skeleton';

const publicPages = [
    '/',
    '/about',
    '/carpooling',
    '/community-rules',
    '/contact',
    '/events',
    '/faq',
    '/help',
    '/housing',
    '/login',
    '/press',
    '/privacy',
    '/register',
    '/settings',
    '/terms',
    '/tutoring',
    '/who-we-are'
];

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
  
  if (user) {
    // For logged-in users, provide the full app layout
    return (
      <SocialLayout>
        {children}
      </SocialLayout>
    );
  }

  // For public visitors, show the marketing site
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
