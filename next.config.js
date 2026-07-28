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

  // ⚠️ 아래 runtimeCaching 은 현재 **동작하지 않는다**.
  //
  // 서비스워커가 한 번도 등록되지 않기 때문이다. next-pwa v5 는 등록 스크립트를
  // pages/_document 에 주입하는데 이 프로젝트에는 _document 가 없다. 실제로
  // 프로덕션 standalone 빌드를 띄우고 확인해도 navigator.serviceWorker
  // .getRegistrations() 가 비어 있고, 응답 HTML 어디에도 sw.js 참조가 없다.
  // 그래서 sw.js 는 생성·제공되지만 아무도 그걸 등록하지 않는다.
  //
  // 한때 "배포해도 옛 화면이 보이는" 문제의 원인을 next-pwa 의 기본
  // StaleWhileRevalidate 로 지목하고 아래 설정을 넣었는데, 그 진단은 틀렸다.
  // 등록조차 안 되는 워커가 캐시를 할 수는 없다. 실제 원인은 CDN 이나 브라우저
  // 캐시 쪽으로 다시 봐야 한다.
  //
  // 설정을 지우지 않고 두는 이유: 서비스워커를 켜기로 결정하면 이 정책이
  // 그대로 필요하다(정적 자산만 CacheFirst, 문서·API 는 NetworkFirst).
  // 켤 때는 _document 추가 또는 직접 등록 코드가 함께 있어야 한다.
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
