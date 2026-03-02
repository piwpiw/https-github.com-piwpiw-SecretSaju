import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WalletProvider } from '@/components/WalletProvider';
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from '@/components/ThemeProvider';
import { LocaleProvider } from '@/lib/i18n';
import { ProfileProvider } from '@/components/ProfileProvider';
import LuckyTicker from '@/components/LuckyTicker';
import LuckySecretModal from '@/components/home/LuckySecretModal';
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;


export const metadata: Metadata = {
  title: 'Secret Saju | 사주 분석 & 일일 운세',
  description: '사주 운세, 꿈, 손금 등 나의 운명을 확인하는 프리미엄 운세 플랫폼입니다.',
  themeColor: '#0f0f1a',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  openGraph: {
    title: 'Secret Saju | 사주 분석 & 일일 운세',
    description: '사주 운세, 꿈, 손금 등 내 운명을 지금 바로 확인하세요.',
    url: 'https://secret-saju.vercel.app',
    siteName: 'Secret Saju',
    images: [
      {
        url: 'https://secret-saju.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Secret Saju | 사주 분석 & 일일 운세',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secret Saju | 사주 분석 & 일일 운세',
    description: '가장 빠르고 정확한 프리미엄 사주 운세를 확인하세요.',
    images: ['https://secret-saju.vercel.app/og-image.jpg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Secret Saju',
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
              <ProfileProvider>
                <LuckySecretModal />
                <LuckyTicker />
                <Nav />
                <div className="flex-1 w-full max-w-7xl mx-auto relative px-4 md:px-8">
                  {children}
                </div>
                <Footer />
              </ProfileProvider>
            </WalletProvider>
          </ThemeProvider>
        </LocaleProvider>
        <Analytics />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

