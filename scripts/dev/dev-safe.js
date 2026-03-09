#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn, spawnSync } = require('child_process');

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function getArgValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

function parsePort(value) {
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`invalid port: ${value}`);
  }
  return port;
}

function parsePositiveInt(value, name) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`invalid ${name}: ${value}`);
  }
  return parsed;
}

function toRunOptions() {
  return {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  };
}

function removePathIfExists(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return false;
  }

  fs.rmSync(targetPath, { recursive: true, force: true });
  return true;
}

function cleanNextArtifacts(mode) {
  const root = process.cwd();
  const targets =
    mode === 'full'
      ? [path.join(root, '.next')]
      : [path.join(root, '.next', 'cache', 'webpack')];

  let removedAny = false;
  targets.forEach((target) => {
    if (removePathIfExists(target)) {
      console.log(`[dev:safe] removed ${path.relative(root, target) || target}`);
      removedAny = true;
    }
  });

  if (!removedAny) {
    console.log(`[dev:safe] no Next.js ${mode === 'full' ? 'build output' : 'webpack cache'} to clean`);
  }
}

function findListeningPidsOnPort(port) {
  if (process.platform === 'win32') {
    try {
      const output = execSync(`netstat -ano -p tcp | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });

      return output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => line.includes('LISTENING'))
        .map((line) => {
          const match = line.match(/\s+(\d+)\s*$/);
          return match ? Number(match[1]) : null;
        })
        .filter((pid) => Number.isInteger(pid));
    } catch {
      return [];
    }
  }

  try {
    const output = execSync(`lsof -ti tcp:${port}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((value) => Number(value))
      .filter((pid) => Number.isInteger(pid));
  } catch {
    return [];
  }
}

function killPid(pid) {
  if (pid === process.pid) return;

  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
      return;
    } catch {
      return;
    }
  }

  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    // no-op
  }
}

function isPortFree(port) {
  return findListeningPidsOnPort(port).length === 0;
}

function findFreePort(startPort, range) {
  for (let offset = 0; offset <= range; offset += 1) {
    const candidate = startPort + offset;
    if (candidate > 65535) {
      return null;
    }
    if (isPortFree(candidate)) {
      return candidate;
    }
  }
  return null;
}

function runPreflight() {
  const result = spawnSync('npm', ['run', 'preflight:local'], toRunOptions());
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function startDev(host, port) {
  const child = spawn('npm', ['run', 'dev', '--', '--hostname', host, '--port', String(port)], toRunOptions());
  child.on('exit', (code) => process.exit(code || 0));
  child.on('error', (error) => {
    console.error(`[dev:safe] failed to start dev server: ${error.message}`);
    process.exit(1);
  });
}

function main() {
  const host = getArgValue('--host', '127.0.0.1');
  const requestedPort = parsePort(getArgValue('--port', process.env.PORT || '3000'));
  const skipPreflight = hasFlag('--skip-preflight');
  const autoPort = hasFlag('--auto-port');
  const autoPortRange = parsePositiveInt(getArgValue('--auto-port-range', '10'), 'auto-port-range');
  const cleanFull = hasFlag('--clean-full');
  const skipCacheClean = hasFlag('--skip-cache-clean');
  let port = requestedPort;

  console.log(`[dev:safe] target host=${host} requested-port=${requestedPort}`);

  const pids = Array.from(new Set(findListeningPidsOnPort(port)));
  if (pids.length > 0) {
    console.log(`[dev:safe] terminating existing listeners on ${port}: ${pids.join(', ')}`);
    pids.forEach(killPid);
  } else {
    console.log(`[dev:safe] no existing listener on port ${port}`);
  }

  const remaining = Array.from(new Set(findListeningPidsOnPort(port)));
  if (remaining.length > 0) {
    if (!autoPort) {
      throw new Error(
        `port ${port} is still in use after termination attempt: ${remaining.join(', ')}. ` +
          'use --auto-port or choose another --port'
      );
    }

    const fallback = findFreePort(port + 1, autoPortRange);
    if (!fallback) {
      throw new Error(`no available fallback port found from ${port + 1} to ${port + autoPortRange}`);
    }

    console.log(`[dev:safe] port ${port} still busy (${remaining.join(', ')}), switching to ${fallback}`);
    port = fallback;
  }

  if (!skipPreflight) {
    console.log('[dev:safe] running preflight gate...');
    runPreflight();
  } else {
    console.log('[dev:safe] preflight gate skipped');
  }

  if (cleanFull) {
    cleanNextArtifacts('full');
  } else if (!skipCacheClean) {
    cleanNextArtifacts('webpack');
  } else {
    console.log('[dev:safe] Next.js cache cleanup skipped');
  }

  console.log(`[dev:safe] starting Next.js dev server on ${host}:${port}...`);
  startDev(host, port);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`[dev:safe] ${error.message}`);
    process.exit(1);
  }
}
