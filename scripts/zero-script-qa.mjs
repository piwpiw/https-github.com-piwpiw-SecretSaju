import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.join(process.cwd(), 'src', 'app');
const BACKLOG_FILE = path.join(process.cwd(), 'docs', '00-overview', 'execution-backlog-ko.md');
const LOG_FILE = path.join(process.cwd(), 'qa-report.log');

function collectPageRoutes() {
  const routes = [];

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (entry.name !== 'page.tsx' && entry.name !== 'page.ts') continue;

      const relativePath = path.relative(APP_DIR, fullPath).replace(/\\/g, '/');
      const dirPath = relativePath.replace(/\/page\.[^/]+$/, '');
      const route = !dirPath || dirPath === 'page.tsx' || dirPath === 'page.ts' ? '/' : `/${dirPath}`;
      if (!route.startsWith('/api/')) routes.push(route);
    }
  };

  walk(APP_DIR);
  return [...new Set(routes)].sort();
}

function normalizeBacklogRoute(cell) {
  if (!cell) return null;
  const match = cell.trim().match(/`([^`]+)`/);
  const raw = match ? match[1].trim() : cell.trim().split(' ')[0];
  if (!raw || raw === 'Route') return null;
  if (!raw.startsWith('/')) return null;
  return raw;
}

function collectBacklogRoutes() {
  const lines = fs.readFileSync(BACKLOG_FILE, 'utf-8').split(/\r?\n/);
  const routes = new Set();
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    if (trimmed.includes('---')) continue;
    const cells = trimmed.split('|').slice(1).map((cell) => cell.trim());
    const route = normalizeBacklogRoute(cells[0]);
    if (!route) continue;
    routes.add(route);
  }
  return [...routes].sort();
}

function validateRouteContracts() {
  const appRoutes = collectPageRoutes();
  const backlogRoutes = collectBacklogRoutes();
  const appSet = new Set(appRoutes);
  return {
    appRoutes: appRoutes.length,
    backlogRoutes: backlogRoutes.length,
    missingInBacklog: appRoutes.filter((route) => !backlogRoutes.includes(route)),
    extraInBacklog: backlogRoutes.filter((route) => !appSet.has(route)),
  };
}

console.log('[ZORO QA] run lint & TypeScript...');

let lintPassed = true;
let tscPassed = true;
let outputLog = '';

try {
  const lintOut = execSync('npm run lint', { encoding: 'utf-8', stdio: 'pipe' });
  outputLog += 'Lint passed:\n' + lintOut + '\n';
} catch (e) {
  lintPassed = false;
  outputLog += 'Lint failed:\n' + (e.stdout || '') + '\n' + (e.stderr || '') + '\n';
}

try {
  const tscOut = execSync('npx tsc --noEmit', { encoding: 'utf-8', stdio: 'pipe' });
  outputLog += 'TSC passed:\n' + tscOut + '\n';
} catch (e) {
  tscPassed = false;
  outputLog += 'TSC failed:\n' + (e.stdout || '') + '\n' + (e.stderr || '') + '\n';
}

const routeCheck = validateRouteContracts();
outputLog += '\n[Route Contract Sync]\n';
outputLog += `App routes: ${routeCheck.appRoutes}\n`;
outputLog += `Backlog routes: ${routeCheck.backlogRoutes}\n`;
outputLog += `Missing in backlog: ${routeCheck.missingInBacklog.length}\n`;
routeCheck.missingInBacklog.forEach((route) => {
  outputLog += `  - ${route}\n`;
});
outputLog += `Extra in backlog: ${routeCheck.extraInBacklog.length}\n`;
routeCheck.extraInBacklog.forEach((route) => {
  outputLog += `  - ${route}\n`;
});

fs.writeFileSync(LOG_FILE, outputLog, 'utf-8');

if (lintPassed && tscPassed && !routeCheck.missingInBacklog.length && !routeCheck.extraInBacklog.length) {
  console.log('[ZORO QA] all checks passed');
  process.exit(0);
}

if (routeCheck.missingInBacklog.length || routeCheck.extraInBacklog.length) {
  console.log('Route contract mismatch: update docs/00-overview/execution-backlog-ko.md');
}
console.log('[ZORO QA] failed. check qa-report.log for details');
process.exit(1);
