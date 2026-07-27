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
  swcMinify: true,
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

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,

  // 배포해도 사용자 화면이 안 바뀌던 문제.
  //
  // next-pwa 기본 runtimeCaching은 페이지·RSC 응답까지 StaleWhileRevalidate로
  // 캐시한다. 그래서 새 버전을 배포해도 **첫 방문에는 캐시에 있던 옛 화면**이
  // 그대로 뜨고, 두 번째 로드에야 반영된다. 고쳤다고 알린 뒤에도 사용자가
  // "안 고쳐졌는데?" 를 보게 되는 원인이었다.
  //
  // 해시가 붙어 불변인 정적 자산(/_next/static/...)만 캐시에서 바로 주고,
  // 문서·데이터·API는 항상 네트워크를 먼저 본다. 오프라인일 때만 캐시로 떨어진다.
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/[^/]+\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static-immutable",
        expiration: { maxEntries: 256, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|woff2?)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 128, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      // 문서·RSC 페이로드·API — 최신이 항상 우선, 실패 시에만 캐시.
      urlPattern: /^https?:\/\/[^/]+\/(?!_next\/static\/).*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "app-runtime",
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 96, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
  ],
});

module.exports = withPWA(nextConfig);
