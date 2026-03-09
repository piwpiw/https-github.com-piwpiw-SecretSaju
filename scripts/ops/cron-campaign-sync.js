#!/usr/bin/env node

const { setTimeout: sleep } = require('timers/promises');

const BASE_URL = process.env.CRON_BASE_URL || process.env.RENDER_EXTERNAL_URL || process.env.RENDER_EXTERNAL_HOSTNAME || '';
const PATH = process.env.CRON_SYNC_PATH || '/api/cron/campaigns/sync';
const SECRET = process.env.CRON_SECRET || '';

async function run() {
  if (!BASE_URL) {
    console.error('[cron-campaign-sync] CRON_BASE_URL is not configured.');
    process.exit(1);
  }

  let targetUrl = BASE_URL.startsWith('http://') || BASE_URL.startsWith('https://') ? BASE_URL : `https://${BASE_URL}`;
  targetUrl = `${targetUrl.replace(/\/$/, '')}${PATH.startsWith('/') ? PATH : `/${PATH}`}`;

  const headers = {};
  if (SECRET) {
    headers.authorization = `Bearer ${SECRET}`;
  }

  const response = await fetch(targetUrl, {
    method: 'GET',
    headers,
  });

  const text = await response.text();
  if (!response.ok) {
    console.error(`[cron-campaign-sync] failed (${response.status}): ${text}`);
    process.exit(1);
  }

  console.log('[cron-campaign-sync] synced:', text);
}

run().catch(async (error) => {
  console.error('[cron-campaign-sync] error:', error?.message || error);
  await sleep(250);
  process.exit(1);
});
