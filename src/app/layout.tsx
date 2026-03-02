import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WalletProvider } from '@/components/WalletProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LocaleProvider } from '@/lib/i18n';
import { ProfileProvider } from '@/components/ProfileProvider';
import LuckyTicker from '@/components/LuckyTicker';
import LuckySecretModal from '@/components/home/LuckySecretModal';
import Script from 'next/script';
import { APP_CONFIG } from '@/config/env';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;


export const metadata: Metadata = {
  title: 'Secret Saju | ?ъ＜ 遺꾩꽍 & ?쇱씪 ?댁꽭',
  description: '?ъ＜ ?댁꽭, 轅? ?먭툑 ???섏쓽 ?대챸???뺤씤?섎뒗 ?꾨━誘몄뾼 ?댁꽭 ?뚮옯?쇱엯?덈떎.',
  metadataBase: new URL(APP_CONFIG.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'),
  openGraph: {
    title: 'Secret Saju | ?ъ＜ 遺꾩꽍 & ?쇱씪 ?댁꽭',
    description: '?ъ＜ ?댁꽭, 轅? ?먭툑 ?????대챸??吏湲?諛붾줈 ?뺤씤?섏꽭??',
    url: APP_CONFIG.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
    siteName: 'Secret Saju',
    images: [
      {
        url: `${APP_CONFIG.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Secret Saju | ?ъ＜ 遺꾩꽍 & ?쇱씪 ?댁꽭',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secret Saju | ?ъ＜ 遺꾩꽍 & ?쇱씪 ?댁꽭',
    description: '媛??鍮좊Ⅴ怨??뺥솗???꾨━誘몄뾼 ?ъ＜ ?댁꽭瑜??뺤씤?섏꽭??',
    images: [`${APP_CONFIG.BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/og-image.jpg`],
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

