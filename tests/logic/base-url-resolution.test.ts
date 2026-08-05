/**
 * base-url-resolution.test.ts — 기준 도메인 해석 가드
 *
 * 배경: robots.ts / sitemap.ts / referral·generate 에 각각
 * 'https://secret-saju.vercel.app', 'https://secretsaju.example.com' 같은
 * **실재하지 않는 도메인**이 fallback 으로 박혀 있었다. NEXT_PUBLIC_BASE_URL
 * 이 비면 조용히 그 값이 쓰여서
 *   - 검색엔진에 엉뚱한 sitemap 절대 URL 을 알려주고
 *   - 사용자에게 열리지 않는 추천 링크가 정상인 것처럼 발급됐다.
 *
 * 이 파일은 (1) 해석 우선순위와 (2) "못 구하면 빈 문자열" 계약, 그리고
 * (3) 소스에 가짜 도메인이 다시 들어오지 않는 것을 함께 잠근다.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..');

/** 기준 도메인에 영향을 주는 모든 환경변수 */
const BASE_URL_ENV_KEYS = [
    'NEXT_PUBLIC_BASE_URL',
    'NEXT_PUBLIC_APP_URL',
    'VERCEL_PROJECT_PRODUCTION_URL',
    'RENDER_EXTERNAL_HOSTNAME',
    'RENDER_EXTERNAL_URL',
    'RENDER_URL',
] as const;

let saved: Record<string, string | undefined> = {};

async function loadResolver(env: Partial<Record<string, string>>) {
    for (const key of BASE_URL_ENV_KEYS) delete process.env[key];
    Object.assign(process.env, env);
    vi.resetModules();
    const mod = await import('@/config/env');
    return mod.resolveServerBaseUrl;
}

beforeEach(() => {
    saved = {};
    for (const key of BASE_URL_ENV_KEYS) saved[key] = process.env[key];
});

afterEach(() => {
    for (const key of BASE_URL_ENV_KEYS) {
        if (saved[key] === undefined) delete process.env[key];
        else process.env[key] = saved[key];
    }
    vi.resetModules();
});

describe('resolveServerBaseUrl — 해석 우선순위', () => {
    it('명시 설정(NEXT_PUBLIC_BASE_URL)이 최우선이다', async () => {
        const resolve = await loadResolver({
            NEXT_PUBLIC_BASE_URL: 'https://real-domain.example',
            VERCEL_PROJECT_PRODUCTION_URL: 'vercel-fallback.vercel.app',
        });
        expect(resolve()).toBe('https://real-domain.example');
    });

    it('명시 설정이 없으면 Vercel 프로덕션 도메인을 쓰고 https 를 붙인다', async () => {
        const resolve = await loadResolver({
            VERCEL_PROJECT_PRODUCTION_URL: 'my-project.vercel.app',
        });
        expect(resolve()).toBe('https://my-project.vercel.app');
    });

    it('Vercel 값에 이미 스킴이 있으면 중복해서 붙이지 않는다', async () => {
        const resolve = await loadResolver({
            VERCEL_PROJECT_PRODUCTION_URL: 'https://my-project.vercel.app',
        });
        expect(resolve()).toBe('https://my-project.vercel.app');
    });

    it('아무것도 없으면 빈 문자열이다 — 도메인을 지어내지 않는다', async () => {
        const resolve = await loadResolver({});
        expect(resolve()).toBe('');
    });
});

describe('정적 파일이 메타데이터 라우트를 가리지 않는다', () => {
    /**
     * public/ 의 정적 파일은 같은 경로의 App Router 메타데이터 라우트보다
     * 우선한다. 예전에 public/robots.txt 가 src/app/robots.ts 를 가려서,
     * 실제로 서빙되던 robots.txt 는 'Sitemap: https://your-domain.com/...'
     * 이라는 플레이스홀더였다 — 코드를 고쳐도 반영되지 않았다.
     */
    const SHADOWED = ['robots.txt', 'sitemap.xml'];

    for (const name of SHADOWED) {
        it(`public/${name} 이 존재하지 않는다`, async () => {
            const { existsSync } = await import('node:fs');
            expect(
                existsSync(join(ROOT, 'public', name)),
                `public/${name} 이 src/app/${name.replace(/\.\w+$/, '.ts')} 를 가립니다`
            ).toBe(false);
        });
    }
});

describe('가짜 도메인 재유입 차단', () => {
    /** 과거에 fallback 으로 박혀 있던 실재하지 않는 도메인들 */
    const FABRICATED = ['secret-saju.vercel.app', 'secretsaju.example.com'];

    const GUARDED_FILES = [
        'src/app/robots.ts',
        'src/app/sitemap.ts',
        'src/app/api/referral/generate/route.ts',
        'src/config/env.ts',
    ];

    /**
     * 주석을 제거한다. "예전에는 이 도메인을 fallback 으로 썼다"는 설명은
     * 남겨 둘 수 있어야 하고, 가드는 실제로 실행되는 코드만 봐야 한다.
     *
     * ⚠️ 라인 주석은 앞 글자가 ':' 가 아닐 때만 주석으로 본다. 그냥 `//.*$`
     * 로 지우면 'https://도메인' 의 '//' 를 주석 시작으로 오인해 검사 대상인
     * 도메인을 통째로 지워 버린다 (실제로 이 가드가 그래서 한 번 무력화됐다).
     */
    function stripComments(src: string): string {
        return src
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/(^|[^:])\/\/.*$/gm, '$1');
    }

    for (const file of GUARDED_FILES) {
        it(`${file} 에 가짜 도메인이 URL 로 쓰이지 않는다`, () => {
            const code = stripComments(readFileSync(join(ROOT, file), 'utf8'));
            for (const domain of FABRICATED) {
                const literal = new RegExp(`['"\`]https?://${domain.replace(/\./g, '\\.')}`);
                expect(literal.test(code), `${file} 에 '${domain}' 리터럴이 있음`).toBe(false);
            }
        });
    }
});
