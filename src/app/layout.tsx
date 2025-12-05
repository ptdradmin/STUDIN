
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Poppins } from 'next/font/google';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { LanguageProvider } from '@/contexts/language-context';
import type { Metadata } from 'next';
import BottomNavbar from '@/components/bottom-navbar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://stud-in.com'),
  title: "STUD'IN",
  description: "La plateforme qui simplifie la vie étudiante.",
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} dark`}>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <LanguageProvider>
            {children}
            <BottomNavbar />
          </LanguageProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
