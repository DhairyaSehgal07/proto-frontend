import { Inter, Lusitana, Montserrat, Noto_Sans, Geist, Geist_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const lusitana = Lusitana({
  variable: '--font-lusitana',
  weight: ['400', '700'],
  subsets: ['latin'],
});

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-noto-sans',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const fonts = {
  geistMono,
  geistSans,
  notoSans,
  montserrat,
  lusitana,
  inter,
};
