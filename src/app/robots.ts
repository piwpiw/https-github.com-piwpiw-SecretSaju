import { MetadataRoute } from 'next';
import { resolveServerBaseUrl } from '@/config/env';

/**
 * robots.txt 의 **단일 원본**.
 *
 * 예전에는 public/robots.txt 라는 정적 파일이 이 라우트를 가려서, 실제로
 * 서빙되던 것은 'Sitemap: https://your-domain.com/sitemap.xml' 이라는
 * 플레이스홀더였다. 크롤러에게 존재하지 않는 도메인을 알려주고 있었다.
 * 정적 파일은 제거했고, tests/logic/base-url-resolution.test.ts 가 재유입을 막는다.
 *
 * disallow 목록은 sitemap.ts 의 제외 기준과 함께 관리한다.
 * /_next/ 는 일부러 넣지 않는다 — 막으면 크롤러가 CSS/JS 를 못 받아
 * 페이지를 렌더링하지 못해 오히려 색인 품질이 떨어진다.
 */
export default function robots(): MetadataRoute.Robots {
    const baseUrl = resolveServerBaseUrl();

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/payment/', '/mypage'],
        },
        // 기준 도메인을 못 구하면 sitemap 줄 자체를 뺀다. 잘못된 절대 URL 을
        // 크롤러에게 알려주는 것보다 알려주지 않는 편이 안전하다.
        ...(baseUrl ? { sitemap: `${baseUrl}/sitemap.xml` } : {}),
    };
}
