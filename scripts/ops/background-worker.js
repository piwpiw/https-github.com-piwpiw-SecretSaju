#!/usr/bin/env node

const sleepMs = Number(process.env.WORKER_SLEEP_MS || process.env.BACKGROUND_WORKER_INTERVAL_MS || 60000);
const interval = Number.isFinite(sleepMs) && sleepMs > 1000 ? sleepMs : 60000;

(async function run() {
  console.log('[background-worker] started');
  while (true) {
    console.log('[background-worker] heartbeat', new Date().toISOString());
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
})();
