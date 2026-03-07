#!/usr/bin/env node

const { execSync } = require('child_process');

function getArgValue(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index >= 0 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return fallback;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

const TIER_COMMANDS = {
  fast: [
    { label: 'preflight', command: 'npm run preflight:local' },
    { label: 'test', command: 'npm run test' },
  ],
  logic: [
    { label: 'logic-tests', command: 'npm run test:logic' },
  ],
  engine: [
    { label: 'preflight', command: 'npm run preflight:local' },
    { label: 'engine-tests', command: 'npm run test:engine' },
    { label: 'build', command: 'npm run build' },
  ],
  release: [
    { label: 'preflight', command: 'npm run preflight:local' },
    { label: 'test', command: 'npm run test' },
    { label: 'build', command: 'npm run build' },
  ],
  golden: [
    { label: 'golden-tests', command: 'npm run test:golden' },
  ],
  'smoke-auth': [
    { label: 'smoke-auth', command: 'npm run smoke:auth' },
  ],
  'smoke-fast': [
    { label: 'smoke-fast', command: 'npm run smoke:fast' },
  ],
  'smoke-full': [
    { label: 'smoke-full', command: 'npm run smoke:full' },
  ],
};

function printUsage() {
  console.log('[test-local] usage: node scripts/test-local.js --tier <fast|logic|engine|release|golden|smoke-auth|smoke-fast|smoke-full>');
}

function runCommand(label, command) {
  console.log(`[test-local] ${label}...`);
  execSync(command, {
    stdio: 'inherit',
    shell: true,
  });
  console.log(`[test-local] ${label} passed\n`);
}

function main() {
  const tier = getArgValue('--tier', 'fast');
  const listOnly = hasFlag('--list');

  if (listOnly) {
    console.log(Object.keys(TIER_COMMANDS).join('\n'));
    return;
  }

  const steps = TIER_COMMANDS[tier];
  if (!steps) {
    console.error(`[test-local] unknown tier: ${tier}`);
    printUsage();
    process.exit(1);
  }

  console.log(`[test-local] tier=${tier}`);
  for (const step of steps) {
    runCommand(step.label, step.command);
  }
  console.log(`[test-local] tier ${tier} completed`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`[test-local] failed: ${error.message}`);
    process.exit(1);
  }
}
