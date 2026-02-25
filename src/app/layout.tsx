import type { Metadata } from "next";
import { Do_Hyeon, Noto_Sans_KR } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-pretendard",
  display: "swap",
});

const doHyeon = Do_Hyeon({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-do-hyeon",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    template: '%s | Secret Saju',
    default: '멍냥의 이중생활 | Secret Saju - 990 사주마미',
  },
  description:
    '사회적 가면 뒤에 숨겨진 본능을 밈과 데이터로 폭로한다. 60갑자 기반 정밀 사주 계산, 궁합 분석, 개인화된 운세 제공. 너 요즘 왜 그렇게 살아?',
  keywords: [
    '사주',
    '사주팔자',
    '운세',
    '궁합',
    '타로',
    '오늘의 운세',
    '60갑자',
    '명리학',
    '사주 계산',
    '무료 사주',
    '사주 보기',
  ],
  authors: [{ name: 'Secret Paws Team' }],
  creator: 'Secret Paws',
  publisher: 'Secret Paws',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: '/',
    title: '멍냥의 이중생활 | Secret Saju - 990 사주마미',
    description: '사회적 가면 뒤에 숨겨진 본능을 밝혀드립니다. 60갑자 기반 정밀 사주 계산',
    siteName: 'Secret Saju',
  },
  twitter: {
    card: 'summary_large_image',
    title: '멍냥의 이중생활 | Secret Saju',
    description: '사회적 가면 뒤에 숨겨진 본능을 밝혀드립니다',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add when available
    // google: 'verification_token',
    // other: 'verification_token',
  },
};


import { ThemeProvider } from "@/components/ThemeProvider";
import { GlobalCompliance } from "@/components/GlobalCompliance";
import { WalletProvider } from "@/components/WalletProvider";
import { Footer } from "@/components/Footer";
import GlowCursor from "@/components/ui/GlowCursor";
import ScrollProgress from "@/components/ui/ScrollProgress";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Kakao SDK */}
        <script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
          async
        />
        {/* Google Analytics 4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className={`${notoSansKr.variable} ${doHyeon.variable}`}>
        <ThemeProvider>
          <WalletProvider>
            <GlowCursor />
            <ScrollProgress />
            <div className="flex flex-col min-h-screen">
              <Nav />
              <div className="flex-grow flex flex-col">
                {children}
              </div>
              <Footer />
            </div>
            <GlobalCompliance />
          </WalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
