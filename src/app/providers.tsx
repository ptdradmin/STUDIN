'use client';

import { LanguageProvider } from '@/contexts/language-context';
import FirebaseClientProvider from '@/firebase/client-provider';
import Script from 'next/script';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <FirebaseClientProvider>
        {children}
      </FirebaseClientProvider>
    </LanguageProvider>
  );
}
