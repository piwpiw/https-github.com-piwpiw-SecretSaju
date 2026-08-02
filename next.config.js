/** @type {import('next').NextConfig} */
const shouldUseStandalone =
  process.env.NEXT_FORCE_STANDALONE === "1" || process.platform !== "win32";

const nextConfig = {
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
// (serialize-javascript)만 끌고 와서 의존성째 제거했다. PWA 를 다시 켜려면
// App Router 호환 방식(직접 등록 코드 + 정적 자산 CacheFirst, 문서·API
// NetworkFirst 정책)으로 새로 구성해야 한다.
module.exports = nextConfig;
