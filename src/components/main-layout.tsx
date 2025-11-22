
'use client';

import { useUser } from '@/firebase';
import SocialLayout from '@/social/layout';
import SocialPageContent from '@/social/page';
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
    return (
      <SocialLayout>
        <SocialPageContent />
      </SocialLayout>
    );
  }

  // Allow access to public pages only when not logged in
  if (!user && publicPages.includes(pathname)) {
    return (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
    );
  }

  // Fallback for any other cases, e.g. trying to access a protected page while logged out
  // This could be a redirect to login or showing the main page content
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
