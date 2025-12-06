

import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { LanguageProvider } from '@/contexts/language-context';
import { SettingsProvider } from '@/contexts/settings-context';
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://stud-in.com';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "STUD'IN - La plateforme pour la vie étudiante",
    template: "%s | STUD'IN",
  },
  description: "STUD'IN est la plateforme tout-en-un pour les étudiants en Belgique : logement, covoiturage, tutorat, marché aux livres, événements et défis. Simplifiez votre vie étudiante.",
  keywords: [
    'logement étudiant', 'kot', 'studio', 'colocation', 'covoiturage étudiant', 'tutorat',
    'aide aux études', 'livres occasion', 'événements étudiants', 'soirées étudiantes',
    'Belgique', 'Namur', 'Bruxelles', 'Liège', 'Louvain-la-Neuve', 'Mons',
    'UNamur', 'ULB', 'UCLouvain', 'ULiège', 'UMons',
    'vie étudiante', 'application étudiante'
  ],
  authors: [{ name: 'Gui Doba', url: APP_URL }],
  creator: 'Gui Doba',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "STUD'IN - La plateforme qui simplifie la vie étudiante.",
    description: "Trouvez un logement, partagez un trajet, réussissez vos cours et ne manquez aucun événement.",
    url: APP_URL,
    siteName: "STUD'IN",
    images: [
      {
        url: `${APP_URL}/og-image.png`, // Assurez-vous que cette image existe
        width: 1200,
        height: 630,
        alt: "STUD'IN - L'écosystème étudiant",
      },
    ],
    locale: 'fr_BE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "STUD'IN - La plateforme qui simplifie la vie étudiante.",
    description: "Trouvez un logement, partagez un trajet, réussissez vos cours et ne manquez aucun événement.",
    images: [`${APP_URL}/og-image.png`],
  },
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
            <SettingsProvider>
              <LanguageProvider>
                {children}
                <BottomNavbar />
              </LanguageProvider>
            </SettingsProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
