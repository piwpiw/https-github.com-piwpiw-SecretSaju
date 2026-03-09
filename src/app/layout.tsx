import type { Metadata, Viewport } from 'next';
import { Noto_Sans_KR } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { WalletProvider } from '@/components/payment/WalletProvider';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { LocaleProvider } from '@/lib/app/i18n';
import { ProfileProvider } from '@/components/profile/ProfileProvider';
import SystemIssueBanner from '@/components/system/SystemIssueBanner';
import LuckyTicker from '@/components/layout/LuckyTicker';
import LuckySecretModal from '@/components/home/LuckySecretModal';
import RouteChangeTracker from '@/components/analytics/RouteChangeTracker';
import Script from 'next/script';
import { APP_CONFIG } from '@/config/env';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const defaultMetadataImagePath = `${APP_CONFIG.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/api/og?name=Secret%20Saju`;
const notoSans = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Secret Saju | 하이엔드 운명 분석 솔루션',
  description: '최첨단 사주 엔진과 심리 분석으로 당신의 운명을 동기화하는 프리미엄 플랫폼입니다.',
  metadataBase: new URL(APP_CONFIG.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'),
  openGraph: {
    title: 'Secret Saju | 사주와 운세 분석',
    description: '사주와 개인 성향 기반 분석으로 오늘의 선택 포인트를 제안합니다.',
    url: APP_CONFIG.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
    siteName: 'Secret Saju',
    images: [
      {
        url: defaultMetadataImagePath,
        width: 1200,
        height: 630,
        alt: 'Secret Saju | 사주와 운세 분석',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secret Saju | 사주와 운세 분석',
    description: '사주와 심리 인사이트로 다음 액션을 제안하는 실전형 운세 서비스.',
    images: [defaultMetadataImagePath],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Secret Saju',
  },
  manifest: '/manifest.json',
};

import McpAuthRefresher from '@/components/auth/McpAuthRefresher';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`antialiased min-h-screen flex flex-col ${notoSans.className}`}>
        <div className="bg-drift" />
        <LocaleProvider>
          <ThemeProvider>
            <WalletProvider>
              <ProfileProvider>
                <McpAuthRefresher />
                <LuckySecretModal />
                <LuckyTicker />
                <Nav />
                <SystemIssueBanner />
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-black/90 focus:text-white focus:px-3 focus:py-2 focus:rounded"
                >
                  본문으로 건너뛰기
                </a>
                <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto relative px-4 md:px-8">
                  <div className="noise-texture opacity-[0.02]" />
                  {children}
                </main>
                <Footer />
                <RouteChangeTracker />
              </ProfileProvider>
            </WalletProvider>
          </ThemeProvider>
        </LocaleProvider>
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f0f1a',
};
