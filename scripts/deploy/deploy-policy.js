#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;

    const [rawKey, rawValue] = arg.split("=", 2);
    const key = rawKey.replace(/^--/, "");
    const value = rawValue ?? args[i + 1];

    if (rawValue === undefined && value && !value.startsWith("--") && i + 1 < args.length) {
      i += 1;
      parsed[key] = value;
      continue;
    }
    if (rawValue === undefined) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = rawValue;
  }

  return parsed;
}

function fail(message) {
  console.error(`[deploy-policy] ${message}`);
  process.exit(1);
}

function commandExists(command) {
  try {
    execSync(`${command} --version`, { stdio: "ignore" });
    return true;
  } catch (error) {
    return false;
  }
}

function resolveGitBranch() {
  const envBranch = process.env.GITHUB_REF_NAME || process.env.GIT_BRANCH;
  if (envBranch) return envBranch;

  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();
  } catch (error) {
    return null;
  }
}

function verifyDeploymentPolicy(options = {}) {
  const args = parseArgs();
  const platform = (args.platform || process.env.DEPLOY_PLATFORM || "render").toLowerCase();
  const mode = options.mode || args.mode || process.env.DEPLOY_MODE || "production";
  const strictBranch = process.env.DEPLOY_STRICT_BRANCH === "true";
  const branch = resolveGitBranch();

  if (!["render", "vercel"].includes(platform)) {
    fail(`Invalid deployment platform. Allowed: render or vercel. current: ${platform}`);
  }

  if (!["production", "preview"].includes(mode)) {
    fail(`Invalid deployment mode. Allowed: preview or production. current: ${mode}`);
  }

  if (strictBranch && branch) {
    if (mode === "production" && branch !== "main" && process.env.ALLOW_NON_MAIN_PRODUCTION !== "true") {
      fail(`Production deployment requires main branch. current: ${branch}. Use ALLOW_NON_MAIN_PRODUCTION=true to override.`);
    }
    if (mode === "preview" && branch === "main" && process.env.ALLOW_PREVIEW_ON_MAIN !== "true") {
      fail(`Preview deployment cannot target main branch. current: ${branch}. Use ALLOW_PREVIEW_ON_MAIN=true to override.`);
    }
  }

  if (platform === "render") {
    const hookUrl = process.env.RENDER_DEPLOY_HOOK_URL || process.env.RENDER_DEPLOY_HOOK;
    if (!hookUrl) {
      fail("RENDER_DEPLOY_HOOK_URL (or RENDER_DEPLOY_HOOK) is required for Render deployment.");
    }

    const renderFile = path.join(process.cwd(), "render.yaml");
    if (!fs.existsSync(renderFile)) {
      fail("render.yaml is required for Render deployment.");
    }
  }

  if (platform === "vercel") {
    if (!commandExists("vercel")) {
      fail("Vercel CLI is required for Vercel deployment. Install or authenticate Vercel CLI first.");
    }
  }

  const expected = `${platform}/${mode}`;
  const branchInfo = branch ? `, branch=${branch}` : "";
  console.log(`[deploy-policy] policy passed: platform=${platform}, mode=${mode}${branchInfo}`);
  console.log(`[deploy-policy] deployment target enforced (${expected})`);
}

if (require.main === module) {
  verifyDeploymentPolicy();
}

module.exports = { verifyDeploymentPolicy };
