import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WalletProvider } from '@/components/WalletProvider';
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from '@/components/ThemeProvider';
import { LocaleProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: '시크릿사주 | 사주팔자 정밀 분석',
  description: '사주팔자와 음양오행 분석으로 당신의 성격, 운세, 궁합을 정확하게 알려드립니다.',
  themeColor: '#0f0f1a',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: '시크릿사주 | 사주팔자 정밀 분석',
    description: '사주팔자와 음양오행 분석으로 당신의 성격, 운세, 궁합을 알아보세요.',
    url: 'https://secret-saju.vercel.app',
    siteName: '시크릿사주',
    images: [
      {
        url: 'https://secret-saju.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: '시크릿사주 | 사주팔자 정밀 분석',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '시크릿사주',
    description: '사주팔자로 나의 성격과 운세를 정밀 분석해보세요.',
    images: ['https://secret-saju.vercel.app/og-image.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '시크릿사주',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col" style={{ fontFamily: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif' }}>
        <LocaleProvider>
          <ThemeProvider>
            <WalletProvider>
              <Nav />
              <div className="flex-1 w-full max-w-7xl mx-auto relative px-4 md:px-8">
                {children}
              </div>
              <Footer />
            </WalletProvider>
          </ThemeProvider>
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  );
}
