'use client';

import FirebaseClientProvider from '@/firebase/client-provider';
import { LanguageProvider } from '@/contexts/language-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <FirebaseClientProvider>
        {children}
      </FirebaseClientProvider>
    </LanguageProvider>
  );
}
