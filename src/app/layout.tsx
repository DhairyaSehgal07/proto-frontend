import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { getFontVariables, getPrimaryFont } from './fontConfig';
import Providers from '@/context/providers';

export const metadata: Metadata = {
  title: 'Coldop-dev',
  description: 'Coldop beta version',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${getFontVariables()} ${getPrimaryFont()} antialiased`}>
        <Providers>{children}</Providers>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
