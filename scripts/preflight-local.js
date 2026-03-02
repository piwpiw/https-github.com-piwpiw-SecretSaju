#!/usr/bin/env node

const { spawn } = require('child_process');

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function runTask(command, label) {
  return new Promise((resolve) => {
    console.log(`[preflight:local] ${label}...`);
    const child = spawn(command, {
      shell: true,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      const ok = code === 0;
      if (ok) {
        console.log(`[preflight:local] ${label} passed\n`);
      } else {
        console.error(`[preflight:local] ${label} failed (code: ${code})\n`);
      }
      resolve({ key: label, ok });
    });
  });
}

async function main() {
  const startTime = Date.now();
  const parallel = hasFlag('--parallel');

  const tasks = [
    { key: 'lint', label: 'lint', command: 'npm run lint' },
    { key: 'tsc', label: 'type-check', command: 'tsc --noEmit' },
  ];

  const results = {};

  if (parallel) {
    const parallelResults = await Promise.all(tasks.map((task) => runTask(task.command, task.label)));
    parallelResults.forEach((entry) => {
      const target = tasks.find((task) => task.label === entry.key);
      const resultKey = target?.key || entry.key;
      results[resultKey] = entry.ok;
    });
  } else {
    for (const task of tasks) {
      const entry = await runTask(task.command, task.label);
      results[task.key] = entry.ok;
    }
  }

  console.log('[preflight:local] summary');
  console.log(`lint:       ${results.lint ? 'PASS' : 'FAIL'}`);
  console.log(`type-check: ${results.tsc ? 'PASS' : 'FAIL'}`);
  console.log(`[preflight:local] elapsed: ${Date.now() - startTime}ms`);

  const allPassed = Object.values(results).every(Boolean);
  if (allPassed) {
    return;
  }

  process.exit(1);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[preflight:local] unexpected error: ${error.message}`);
    process.exit(1);
  });
}
