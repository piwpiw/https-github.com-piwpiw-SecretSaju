#!/usr/bin/env node

const DEFAULT_PATH = '/api/health';

function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function withHealthPath(baseUrl) {
  const trimmed = baseUrl.replace(/\/+$/, '');
  if (trimmed.endsWith(DEFAULT_PATH)) return trimmed;
  return `${trimmed}${DEFAULT_PATH}`;
}

function resolveHealthUrl() {
  const explicit = process.env.HEALTHCHECK_URL;
  if (explicit) return explicit;

  const baseCandidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.CRON_BASE_URL,
  ].filter(Boolean);

  if (baseCandidates.length === 0) return '';
  return withHealthPath(baseCandidates[0]);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const healthUrl = resolveHealthUrl();
  if (!healthUrl) {
    console.log('[wait-for-health] HEALTHCHECK_URL or NEXT_PUBLIC_* base URL is not set. Skipping.');
    process.exit(0);
  }

  const timeoutSec = toPositiveInt(process.env.HEALTHCHECK_TIMEOUT_SEC, 300);
  const intervalSec = toPositiveInt(process.env.HEALTHCHECK_INTERVAL_SEC, 10);
  const maxAttempts = Math.max(1, Math.ceil(timeoutSec / intervalSec));

  console.log(`[wait-for-health] polling ${healthUrl}`);
  console.log(`[wait-for-health] timeout=${timeoutSec}s interval=${intervalSec}s attempts=${maxAttempts}`);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(healthUrl, { method: 'GET' });
      if (response.ok) {
        console.log(`[wait-for-health] healthy on attempt ${attempt} (status ${response.status})`);
        process.exit(0);
      }
      const body = await response.text();
      console.log(
        `[wait-for-health] attempt ${attempt}/${maxAttempts} not ready (status ${response.status}) ${body.slice(0, 120)}`
      );
    } catch (error) {
      console.log(
        `[wait-for-health] attempt ${attempt}/${maxAttempts} failed: ${error?.message || String(error)}`
      );
    }

    if (attempt < maxAttempts) {
      await sleep(intervalSec * 1000);
    }
  }

  console.error(`[wait-for-health] failed after ${maxAttempts} attempts`);
  process.exit(1);
}

run().catch((error) => {
  console.error(`[wait-for-health] unexpected error: ${error?.message || String(error)}`);
  process.exit(1);
});

