#!/usr/bin/env node

const DEFAULT_BASE_URL = 'http://127.0.0.1:3000';
const DEFAULT_TIMEOUT_MS = 10000;
const ROUTES = ['/', '/login', '/signup', '/auth/callback'];

function getArgValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

function parsePositiveInt(value, name) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`invalid ${name}: ${value}`);
  }
  return parsed;
}

function normalizeBaseUrl(input) {
  return input.replace(/\/+$/, '');
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'cache-control': 'no-cache',
      },
    });
    return { ok: response.status >= 200 && response.status < 400, status: response.status };
  } catch (error) {
    return { ok: false, status: 0, message: error.message };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const baseUrl = normalizeBaseUrl(getArgValue('--base-url', DEFAULT_BASE_URL));
  const timeoutMs = parsePositiveInt(getArgValue('--timeout', String(DEFAULT_TIMEOUT_MS)), 'timeout');

  console.log(`[smoke:auth] base-url=${baseUrl} timeout=${timeoutMs}ms`);

  let failures = 0;
  for (const route of ROUTES) {
    const url = `${baseUrl}${route}`;
    const result = await fetchWithTimeout(url, timeoutMs);

    if (result.ok) {
      console.log(`[smoke:auth] PASS ${route} (${result.status})`);
      continue;
    }

    failures += 1;
    const detail = result.message ? ` - ${result.message}` : '';
    console.error(`[smoke:auth] FAIL ${route} (${result.status})${detail}`);
  }

  if (failures > 0) {
    console.error(`[smoke:auth] failed routes: ${failures}`);
    process.exit(1);
  }

  console.log('[smoke:auth] all auth routes passed');
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[smoke:auth] unexpected error: ${error.message}`);
    process.exit(1);
  });
}
