/** @type {import('next').NextConfig} */
const shouldUseStandalone =
  process.env.NEXT_FORCE_STANDALONE === "1" || process.platform !== "win32";

const nextConfig = {
  // 배포 커밋을 클라이언트에서 볼 수 있게 한다 — 푸터의 빌드 스탬프가
  // "지금 보는 화면이 어느 배포인지"를 즉시 판별하는 용도로 쓴다.
  // (옛 빌드가 기기 캐시에 남아 "고쳐도 옛날 화면"이 재현되던 사고의 진단 장치)
  env: {
    NEXT_PUBLIC_BUILD_SHA: (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7),
  },
  reactStrictMode: true,
  ...(shouldUseStandalone ? { output: "standalone" } : {}),
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // swcMinify 는 Next 15 에서 옵션 자체가 제거됨 (기본 동작)
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? {
          exclude: ["error", "warn"],
        }
      : false,
  },
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },
};

// next-pwa 는 제거했다. v5 는 pages/_document 에 등록 스크립트를 주입하는데
// 이 App Router 프로젝트에는 _document 가 없어 서비스워커가 한 번도 등록된
// 적이 없다(생성만 되고 사용 안 됨). 죽은 코드가 workbox 체인의 취약점
// (serialize-javascript)만 끌고 와서 의존성째 제거했다.
//
// PWA 는 App Router 호환 방식으로 재구성됐다:
// - public/sw.js               : 수작성 서비스워커 (workbox 미사용).
//   정적 자산(/_next/static/, 이미지·폰트) CacheFirst, 문서·RSC·API
//   NetworkFirst, 결제·지갑·인증 API(/api/payment,/api/wallet,/api/auth)는
//   NetworkOnly(캐시 금지). 문서 네트워크 실패 시 public/offline.html 폴백.
// - src/lib/pwa/route-policy.ts: 위 분류 정책의 단일 원본(sw.js 는 사본).
//   tests/logic/pwa-policy.test.ts 로 고정.
// - src/components/pwa/ServiceWorkerRegistrar.tsx: production 에서만
//   sw.js 를 등록 (layout.tsx 에 배선).
module.exports = nextConfig;
