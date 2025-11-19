import { headers } from 'next/headers';

import { SkipNav } from '@kit/ui/skip-nav';
import { Toaster } from '@kit/ui/sonner';
import { cn } from '@kit/ui/utils';

import { RootProviders } from '~/components/root-providers';
import { getFontsClassName } from '~/lib/fonts';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { generateRootMetadata } from '~/lib/root-metadata';
import { getRootTheme } from '~/lib/root-theme';

import '../styles/globals.css';
import { WebVitals } from './web-vitals';

export const generateMetadata = () => {
  return generateRootMetadata();
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, nonce, i18n] = await Promise.all([
    getRootTheme(),
    getCspNonce(),
    createI18nServerInstance(),
  ]);

  const className = getRootClassName(theme);
  const language = i18n.language;

  return (
    <html lang={language} className={className}>
      <body>
        <SkipNav />
        <RootProviders theme={theme} lang={language} nonce={nonce}>
          {children}
        </RootProviders>

        <Toaster richColors={true} theme={theme} position="top-center" />
        <WebVitals />
      </body>
    </html>
  );
}

function getRootClassName(theme: string) {
  const fontsClassName = getFontsClassName(theme);

  return cn(
    'bg-background min-h-screen overscroll-y-none antialiased',
    fontsClassName,
  );
}

async function getCspNonce() {
  const headersStore = await headers();

  return headersStore.get('x-nonce') ?? undefined;
}
