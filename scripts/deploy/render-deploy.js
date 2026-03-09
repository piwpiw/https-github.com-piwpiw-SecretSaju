#!/usr/bin/env node

const { verifyDeploymentPolicy } = require('./deploy-policy');

const hookUrl = process.env.RENDER_DEPLOY_HOOK_URL || process.env.RENDER_DEPLOY_HOOK;
const maxRetries = Math.max(1, Number(process.env.RENDER_DEPLOY_RETRIES || 4));
const timeoutMs = Math.max(1000, Number(process.env.RENDER_DEPLOY_TIMEOUT_MS || 15000));
const intervalMs = Math.max(500, Number(process.env.RENDER_DEPLOY_RETRY_INTERVAL_MS || 2000));

function readMode() {
  const argValue = process.argv.find((arg) => arg.startsWith("--mode="));
  if (argValue) return argValue.split("=", 2)[1];

  const modeIdx = process.argv.indexOf("--mode");
  if (modeIdx >= 0 && process.argv[modeIdx + 1]) return process.argv[modeIdx + 1];

  return process.env.DEPLOY_MODE || "production";
}

const mode = readMode();

function timeoutFetch(input, init = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(input, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(id));
}

verifyDeploymentPolicy({
  mode: mode || "production",
});

if (!hookUrl) {
  console.log('[render-deploy] Render deploy hook is required for policy-enforced deployment.');
  process.exit(1);
}

async function run() {
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt += 1;
    try {
      const response = await timeoutFetch(hookUrl, { method: 'POST' });
      if (response.ok) {
        console.log(`[render-deploy] Render deploy hook triggered. (attempt ${attempt}/${maxRetries})`);
        return;
      }

      const body = await response.text();
      const status = response.status;
      lastError = `Hook failed (${status}): ${body || '(empty response)'}`;
      console.error(`[render-deploy] ${lastError}`);

      if (status >= 500 && status < 600 && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs * attempt));
        continue;
      }

      process.exit(1);
    } catch (error) {
      lastError = `${error?.message || error}`;
      console.error(`[render-deploy] Failed to trigger Render deploy hook (attempt ${attempt}/${maxRetries}): ${lastError}`);

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs * attempt));
        continue;
      }

      break;
    }
  }

  console.error(`[render-deploy] failed after ${maxRetries} attempts: ${lastError}`);
  process.exit(1);
}

run();
