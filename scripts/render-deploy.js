#!/usr/bin/env node

const hookUrl = process.env.RENDER_DEPLOY_HOOK_URL || process.env.RENDER_DEPLOY_HOOK;

if (!hookUrl) {
  console.log('[render-deploy] RENDER_DEPLOY_HOOK_URL is not set. Deployment is expected to be driven by Render autoDeploy from main branch.');
  process.exit(0);
}

async function run() {
  try {
    const response = await fetch(hookUrl, { method: 'POST' });
    if (!response.ok) {
      const body = await response.text();
      console.error(`[render-deploy] Hook failed (${response.status}): ${body || '(empty response)'}`);
      process.exit(1);
    }
    console.log('[render-deploy] Render deploy hook triggered.');
  } catch (error) {
    console.error('[render-deploy] Failed to trigger Render deploy hook:', error?.message || error);
    process.exit(1);
  }
}

run();
