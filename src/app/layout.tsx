import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { WalletProvider } from '@/components/WalletProvider';
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: '사주라떼 - 멍냥의 이중생활',
  description: '당신의 가면에 숨겨진 본능을 깨워줄 가장 트렌디한 사주 명리학',
  themeColor: '#09090b',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1, // Prevent iOS zoom on inputs to improve UX
  },
  openGraph: {
    title: '사주라떼 - 당신의 진짜 모습을 만나다',
    description: '사회적 가면 뒤에 숨겨진 나의 본능을 데이터 기반 사주 명리로 폭로합니다.',
    url: 'https://secret-saju.vercel.app',
    siteName: '사주라떼',
    images: [
      {
        url: 'https://secret-saju.vercel.app/og-image.jpg', // Placeholder for actual OG image
        width: 1200,
        height: 630,
        alt: '사주라떼 멍냥의 이중생활 결과',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '사주라떼',
    description: '가면 뒤에 숨겨진 당신의 본능은 무엇인가요?',
    images: ['https://secret-saju.vercel.app/og-image.jpg'], // Placeholder
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Secret Paws',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white antialiased min-h-screen flex flex-col selection:bg-purple-500/30`}>
        <WalletProvider>
          <Nav />
          <div className="flex-1 w-full max-w-sm mx-auto relative content-wrapper">
            {children}
          </div>
          <Footer />
        </WalletProvider>
        <Analytics />
      </body>
    </html>
  );
}
