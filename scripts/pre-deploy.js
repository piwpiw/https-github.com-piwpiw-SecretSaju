#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { verifyEnv } = require('./verify-env');

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function runStep(command, label) {
  console.log(`[pre-deploy] ${label}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`[pre-deploy] ${label} passed\n`);
    return true;
  } catch (error) {
    console.error(`[pre-deploy] ${label} failed\n`);
    return false;
  }
}

function checkMigrations() {
  console.log('[pre-deploy] checking migration files...');
  const candidates = [
    path.join(__dirname, '..', 'supabase', 'migrations'),
    path.join(__dirname, 'migrations'),
  ];
  const dir = candidates.find((item) => fs.existsSync(item));

  if (!dir) {
    console.error('[pre-deploy] migration directory not found\n');
    return false;
  }

  const migrationFiles = fs.readdirSync(dir).filter((file) => file.endsWith('.sql'));
  if (migrationFiles.length === 0) {
    console.error('[pre-deploy] no migration sql files found\n');
    return false;
  }

  console.log(`[pre-deploy] migration files detected: ${migrationFiles.length}\n`);
  return true;
}

function checkConfigFiles() {
  console.log('[pre-deploy] checking required config files...');

  const requiredFiles = [
    'render.yaml',
    'Dockerfile',
    '.github/workflows/deploy.yml',
    'package.json',
  ];

  const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(__dirname, '..', file)));
  if (missing.length > 0) {
    console.error('[pre-deploy] missing required files:');
    missing.forEach((file) => console.error(`  - ${file}`));
    console.error('');
    return false;
  }

  console.log('[pre-deploy] all required config files exist\n');
  return true;
}

function runParallel(tasks) {
  return Promise.all(
    tasks.map(
      (task) =>
        new Promise((resolve) => {
          console.log(`[pre-deploy] ${task.label}...`);
          const child = spawn(task.command, {
            shell: true,
            stdio: 'inherit',
          });
          child.on('close', (code) => {
            if (code === 0) {
              console.log(`[pre-deploy] ${task.label} passed\n`);
              resolve({ key: task.key, ok: true });
              return;
            }
            console.error(`[pre-deploy] ${task.label} failed (code: ${code})\n`);
            resolve({ key: task.key, ok: false });
          });
        })
    )
  );
}

async function main() {
  console.log('[pre-deploy] starting checks');
  console.log('='.repeat(56));

  const skipEnv = hasFlag('--skip-env');
  const skipConfig = hasFlag('--skip-config');
  const skipMigrations = hasFlag('--skip-migrations');
  const skipIntegrity = hasFlag('--skip-integrity');
  const skipTests = hasFlag('--skip-tests');
  const skipBuild = hasFlag('--skip-build');
  const parallelChecks = hasFlag('--parallel-checks');

  const results = {
    env: true,
    config: true,
    migrations: true,
    integrity: true,
    tests: true,
    build: true,
  };

  if (!skipEnv) {
    try {
      results.env = verifyEnv();
    } catch (error) {
      console.error(`[pre-deploy] env verification failed: ${error.message}`);
      results.env = false;
    }
    console.log('');
  }

  if (!skipConfig) {
    results.config = checkConfigFiles();
  }

  if (!skipMigrations) {
    results.migrations = checkMigrations();
  }

  if (!skipIntegrity) {
    results.integrity = runStep('npm run guard:result-card', 'result-card guard');
  }

  const runnable = [];
  if (!skipTests) runnable.push({ key: 'tests', label: 'tests', command: 'npm test -- --run' });
  if (!skipBuild) runnable.push({ key: 'build', label: 'build', command: 'npm run build' });

  if (parallelChecks && runnable.length > 1) {
    const parallelResults = await runParallel(runnable);
    parallelResults.forEach((entry) => {
      results[entry.key] = entry.ok;
    });
  } else {
    if (!skipTests) results.tests = runStep('npm test -- --run', 'tests');
    if (!skipBuild) results.build = runStep('npm run build', 'build');
  }

  console.log('='.repeat(56));
  console.log('[pre-deploy] summary');
  console.log(`env:        ${results.env ? 'PASS' : 'FAIL'}`);
  console.log(`config:     ${results.config ? 'PASS' : 'FAIL'}`);
  console.log(`migrations: ${results.migrations ? 'PASS' : 'FAIL'}`);
  console.log(`integrity:  ${results.integrity ? 'PASS' : 'FAIL'}`);
  console.log(`tests:      ${results.tests ? 'PASS' : 'FAIL'}`);
  console.log(`build:      ${results.build ? 'PASS' : 'FAIL'}`);

  const allPassed = Object.values(results).every(Boolean);
  if (allPassed) {
    console.log('\n[pre-deploy] all checks passed');
    process.exit(0);
  }

  console.error('\n[pre-deploy] failed. fix issues and retry');
  process.exit(1);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[pre-deploy] unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };
