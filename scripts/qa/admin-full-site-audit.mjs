import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT, 'src', 'app');
const LOG_DIR = path.join(ROOT, 'logs');

dotenv.config({ path: path.join(ROOT, '.env.local') });

function argValue(flag, fallback = '') {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function argInt(flag, fallback) {
  const parsed = Number(argValue(flag, String(fallback)));
  return Number.isFinite(parsed) ? parsed : fallback;
}

const BASE_URL = argValue('--base-url', 'http://127.0.0.1:3002').replace(/\/+$/, '');
const EMAIL = argValue('--email', 'piwpiw@naver.com');
const PASSWORD = argValue('--password', 'admin');
const WORKERS = Math.max(1, argInt('--workers', 8));
const TIMEOUT_MS = Math.max(15000, argInt('--timeout-ms', 45000));
const OUT_PREFIX = argValue('--out-prefix', 'admin-full-site-audit');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const REPORT_JSON = path.join(LOG_DIR, `${OUT_PREFIX}.json`);
const REPORT_MD = path.join(LOG_DIR, `${OUT_PREFIX}.md`);
const BASE_HOSTNAME = (() => {
  try {
    return new URL(BASE_URL).hostname;
  } catch {
    return '127.0.0.1';
  }
})();

function routeFromPagePath(filePath) {
  const rel = path.relative(APP_DIR, filePath).replace(/\\/g, '/');
  if (rel === 'page.tsx') return '/';
  const dir = rel.replace(/\/page\.tsx$/, '');
  return dir === '' ? '/' : `/${dir}`;
}

function isInternalPath(p) {
  return typeof p === 'string' && p.startsWith('/') && !p.startsWith('/api/');
}

function normalizePathname(urlPath) {
  if (!urlPath) return null;
  const [pathname] = urlPath.split('?');
  return pathname.replace(/\/+$/, '') || '/';
}

function walkPageFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPageFiles(fullPath, out);
      continue;
    }
    if (entry.isFile() && entry.name === 'page.tsx') {
      out.push(fullPath);
    }
  }
  return out;
}

function routePatternToRegex(routePattern) {
  const escaped = routePattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[.+?\\\]/g, '[^/]+');
  return new RegExp(`^${escaped}$`);
}

function buildSampleRoute(routePattern) {
  return routePattern
    .replace(/\[type\]/g, 'saju')
    .replace(/\[slug\]/g, 'intro')
    .replace(/\[token\]/g, 'sample-token')
    .replace(/\[id\]/g, '1')
    .replace(/\[[^\]]+\]/g, 'sample');
}

function classifyConsoleError(text) {
  const normalized = String(text || '').toLowerCase();
  if (
    normalized.includes('favicon') ||
    normalized.includes('sourcemap') ||
    normalized.includes('webkit') ||
    normalized.includes('chrome-extension://')
  ) {
    return 'noise';
  }
  return 'error';
}

async function discoverAppRoutes() {
  const pageFiles = walkPageFiles(APP_DIR, []);
  const all = [...new Set(pageFiles.map(routeFromPagePath))].sort();
  const staticRoutes = all.filter((r) => !r.includes('['));
  const dynamicPatterns = all.filter((r) => r.includes('['));
  return { all, staticRoutes, dynamicPatterns };
}

function buildSessionCookieValue(session) {
  const maxAge = Number(session?.expires_in || 7 * 24 * 3600);
  return encodeURIComponent(
    JSON.stringify({
      access_token: session?.access_token,
      refresh_token: session?.refresh_token || null,
      expires_at: Math.floor(Date.now() / 1000) + maxAge,
    })
  );
}

async function createAdminSession() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const candidates =
    EMAIL.toLowerCase() === 'piwpiw@naver.com' && PASSWORD === 'admin'
      ? [PASSWORD, 'admin1']
      : [PASSWORD];

  for (const candidate of candidates) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: EMAIL, password: candidate });
    if (!error && data?.session?.access_token) {
      return { session: data.session, effectivePassword: candidate };
    }
  }
  throw new Error('signInWithPassword failed for provided admin credentials');
}

async function loginAdmin(context) {
  const { session, effectivePassword } = await createAdminSession();

  await context.addCookies([
    {
      name: 'secret_saju_auth_session',
      value: buildSessionCookieValue(session),
      domain: BASE_HOSTNAME,
      path: '/',
      sameSite: 'Lax',
      httpOnly: false,
      secure: false,
    },
    {
      name: 'user_data',
      value: encodeURIComponent(
        JSON.stringify({
          id: session.user?.id || 'admin-user',
          email: EMAIL,
          nickname: EMAIL.split('@')[0] || 'admin',
          auth_provider: 'email',
          provider_user_id: session.user?.id || 'admin-user',
        })
      ),
      domain: BASE_HOSTNAME,
      path: '/',
      sameSite: 'Lax',
      httpOnly: false,
      secure: false,
    },
  ]);

  const page = await context.newPage();
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
  const syncResult = await page.evaluate(async (token) => {
    const res = await fetch('/api/user/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ channel: 'admin-full-site-audit' }),
    });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, body };
  }, session.access_token);

  await page.close();
  return { syncResult, effectivePassword };
}

async function auditRoute(context, route, mode = 'full') {
  const page = await context.newPage();
  const url = `${BASE_URL}${route}`;
  const consoleErrors = [];
  const pageErrors = [];
  const response5xx = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' && classifyConsoleError(msg.text()) === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => pageErrors.push(String(err)));
  page.on('response', (res) => {
    if (res.status() >= 500) response5xx.push(`${res.status()} ${res.url()}`);
  });

  const startedAt = Date.now();
  let status = 0;
  let ok = false;
  let error = null;
  let stats = null;
  let links = [];

  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
    status = res?.status() || 0;
    await page.waitForTimeout(600);

    stats = await page.evaluate(() => {
      const text = (document.body?.innerText || '').trim();
      const h1 = document.querySelectorAll('h1').length;
      const buttons = document.querySelectorAll('button').length;
      const inputs = document.querySelectorAll('input,select,textarea').length;
      const forms = document.querySelectorAll('form').length;
      const hasMain = !!document.querySelector('main');
      const hasNav = !!document.querySelector('nav');
      const hasFooter = !!document.querySelector('footer');
      return {
        title: document.title || '',
        textLength: text.length,
        h1,
        buttons,
        inputs,
        forms,
        hasMain,
        hasNav,
        hasFooter,
      };
    });

    links = await page.evaluate(() => {
      const hrefs = Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href'))
        .filter(Boolean);
      return [...new Set(hrefs)];
    });

    if (mode === 'full') {
      ok = status >= 200 && status < 400 && pageErrors.length === 0;
    } else {
      // sample mode is for unresolved dynamic routes without guaranteed fixture data.
      ok = status >= 200 && status < 500 && pageErrors.length === 0;
    }
  } catch (e) {
    error = String(e?.message || e);
    ok = false;
  } finally {
    await page.close();
  }

  return {
    route,
    mode,
    ok,
    status,
    durationMs: Date.now() - startedAt,
    error,
    stats,
    consoleErrors: consoleErrors.slice(0, 20),
    pageErrors: pageErrors.slice(0, 20),
    response5xx: response5xx.slice(0, 20),
    links: links
      .map((href) => normalizePathname(href))
      .filter((p) => p && isInternalPath(p))
      .slice(0, 200),
  };
}

async function runPool(context, routes, mode = 'full') {
  const queue = [...routes];
  const results = [];

  async function worker() {
    while (queue.length > 0) {
      const route = queue.shift();
      if (!route) return;
      const result = await auditRoute(context, route, mode);
      results.push(result);
      const mark = result.ok ? 'PASS' : 'FAIL';
      console.log(`[audit:${mode}] ${mark} ${route} status=${result.status} time=${result.durationMs}ms`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(WORKERS, routes.length) }, () => worker()));
  return results.sort((a, b) => a.route.localeCompare(b.route));
}

function summarizeFindings(results) {
  const failed = results.filter((r) => !r.ok);
  const errorRoutes = failed.map((r) => ({
    route: r.route,
    status: r.status,
    error: r.error,
    pageErrors: r.pageErrors.slice(0, 3),
    consoleErrors: r.consoleErrors.slice(0, 3),
    response5xx: r.response5xx.slice(0, 3),
  }));
  const avgMs = results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.durationMs, 0) / results.length) : 0;
  return {
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    avgMs,
    errorRoutes,
  };
}

function makeMarkdownReport(payload) {
  const lines = [];
  lines.push(`# Admin Full Site Audit`);
  lines.push('');
  lines.push(`- Base URL: \`${payload.baseUrl}\``);
  lines.push(`- Started At: \`${payload.startedAt}\``);
  lines.push(`- Finished At: \`${payload.finishedAt}\``);
  lines.push(`- Workers: \`${payload.workers}\``);
  lines.push(`- Effective Password: \`${payload.effectivePassword}\``);
  lines.push(`- Jelly checks: \`excluded\``);
  lines.push('');
  lines.push(`## Sync`);
  lines.push(`- sync.ok: \`${payload.sync?.ok}\``);
  lines.push(`- sync.status: \`${payload.sync?.status}\``);
  lines.push(`- sync.isAdmin: \`${payload.sync?.body?.user?.isAdmin ?? null}\``);
  lines.push('');
  lines.push(`## Summary`);
  lines.push(`- Static routes: ${payload.summary.static.total} (pass ${payload.summary.static.passed} / fail ${payload.summary.static.failed})`);
  lines.push(`- Discovered extra routes: ${payload.summary.discovered.total} (pass ${payload.summary.discovered.passed} / fail ${payload.summary.discovered.failed})`);
  lines.push(`- Dynamic sample routes: ${payload.summary.dynamic.total} (pass ${payload.summary.dynamic.passed} / fail ${payload.summary.dynamic.failed})`);
  lines.push(`- Total audited routes: ${payload.summary.total}`);
  lines.push(`- Total failures: ${payload.summary.failures}`);
  lines.push('');

  const allFailures = [
    ...payload.failures.static.map((x) => ({ source: 'static', ...x })),
    ...payload.failures.discovered.map((x) => ({ source: 'discovered', ...x })),
    ...payload.failures.dynamic.map((x) => ({ source: 'dynamic-sample', ...x })),
  ];

  lines.push(`## Failures`);
  if (allFailures.length === 0) {
    lines.push(`- none`);
  } else {
    for (const f of allFailures) {
      lines.push(`- [${f.source}] \`${f.route}\` status=${f.status} error=${f.error || 'none'}`);
      if (f.response5xx?.length) lines.push(`  - 5xx: ${f.response5xx.join(' | ')}`);
      if (f.pageErrors?.length) lines.push(`  - pageerror: ${f.pageErrors.join(' | ')}`);
      if (f.consoleErrors?.length) lines.push(`  - console: ${f.consoleErrors.join(' | ')}`);
    }
  }

  lines.push('');
  lines.push(`## Note`);
  lines.push(`- Dynamic sample routes are best-effort checks for unresolved dynamic patterns without fixture IDs.`);
  lines.push(`- This run intentionally does not validate jelly balance/consume behavior.`);
  return lines.join('\n');
}

async function main() {
  const startedAt = new Date().toISOString();
  fs.mkdirSync(LOG_DIR, { recursive: true });

  const { staticRoutes, dynamicPatterns } = await discoverAppRoutes();
  console.log(`[audit] static=${staticRoutes.length} dynamicPatterns=${dynamicPatterns.length}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  try {
    const loginResult = await loginAdmin(context);
    console.log(`[audit] login ok, effectivePassword=${loginResult.effectivePassword}`);

    const staticResults = await runPool(context, staticRoutes, 'full');

    const discoveredRoutes = [...new Set(staticResults.flatMap((r) => r.links))]
      .map((x) => normalizePathname(x))
      .filter((x) => x && isInternalPath(x))
      .filter((x) => !staticRoutes.includes(x))
      .sort();
    console.log(`[audit] discovered extra routes=${discoveredRoutes.length}`);

    const discoveredResults = discoveredRoutes.length > 0 ? await runPool(context, discoveredRoutes, 'full') : [];

    const testedRoutes = new Set([
      ...staticResults.map((r) => r.route),
      ...discoveredResults.map((r) => r.route),
    ]);

    const unresolvedDynamicPatterns = dynamicPatterns.filter((pattern) => {
      const matcher = routePatternToRegex(pattern);
      for (const route of testedRoutes) {
        if (matcher.test(route)) return false;
      }
      return true;
    });

    const sampleDynamicRoutes = unresolvedDynamicPatterns.map(buildSampleRoute);
    const dynamicResults =
      sampleDynamicRoutes.length > 0 ? await runPool(context, sampleDynamicRoutes, 'sample') : [];

    const staticSummary = summarizeFindings(staticResults);
    const discoveredSummary = summarizeFindings(discoveredResults);
    const dynamicSummary = summarizeFindings(dynamicResults);

    const finishedAt = new Date().toISOString();
    const payload = {
      baseUrl: BASE_URL,
      startedAt,
      finishedAt,
      workers: WORKERS,
      email: EMAIL,
      effectivePassword: loginResult.effectivePassword,
      jellyChecksExcluded: true,
      sync: loginResult.syncResult,
      routes: {
        static: staticRoutes,
        discovered: discoveredRoutes,
        dynamicPatterns,
        sampleDynamicRoutes,
      },
      summary: {
        static: staticSummary,
        discovered: discoveredSummary,
        dynamic: dynamicSummary,
        total: staticSummary.total + discoveredSummary.total + dynamicSummary.total,
        failures: staticSummary.failed + discoveredSummary.failed + dynamicSummary.failed,
      },
      failures: {
        static: staticSummary.errorRoutes,
        discovered: discoveredSummary.errorRoutes,
        dynamic: dynamicSummary.errorRoutes,
      },
      results: {
        static: staticResults,
        discovered: discoveredResults,
        dynamic: dynamicResults,
      },
    };

    fs.writeFileSync(REPORT_JSON, JSON.stringify(payload, null, 2), 'utf8');
    fs.writeFileSync(REPORT_MD, makeMarkdownReport(payload), 'utf8');

    console.log(`[audit] report json=${REPORT_JSON}`);
    console.log(`[audit] report md=${REPORT_MD}`);

    if (!loginResult.syncResult?.ok || payload.summary.failures > 0) {
      process.exitCode = 1;
    }
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`[audit] FAIL ${error.message}`);
  process.exit(1);
});
