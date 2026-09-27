import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sop-central-manufacturing.snappy-sky-1661.chatgpt.site'),
  title: 'SOP Central | 제조 표준 관리',
  description: '반도체 제조 현장의 SOP 제정, 검토, 승인, 교육을 한 곳에서 관리합니다.',
  openGraph: {
    title: 'SOP Central',
    description: '반도체 제조 표준 관리 플랫폼',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOP Central',
    description: '반도체 제조 표준 관리 플랫폼',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
