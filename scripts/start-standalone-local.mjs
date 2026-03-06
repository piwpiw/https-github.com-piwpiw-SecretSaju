import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = process.cwd();
const SOURCE_STATIC = path.join(ROOT, '.next', 'static');
const SOURCE_PUBLIC = path.join(ROOT, 'public');
const STANDALONE_DIR = path.join(ROOT, '.next', 'standalone');
const TARGET_STATIC = path.join(STANDALONE_DIR, '.next', 'static');
const TARGET_PUBLIC = path.join(STANDALONE_DIR, 'public');
const SERVER_ENTRY = path.join(STANDALONE_DIR, 'server.js');

function argValue(flag, fallback = '') {
    const index = process.argv.indexOf(flag);
    if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
    return fallback;
}

function ensureExists(targetPath, label) {
    if (!fs.existsSync(targetPath)) {
        throw new Error(`${label} missing: ${targetPath}`);
    }
}

function copyDirectory(source, target) {
    if (!fs.existsSync(source)) return;
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(source, target, { recursive: true, force: true });
}

async function main() {
    const port = argValue('--port', process.env.PORT || '3002');
    const host = argValue('--host', process.env.HOSTNAME || '127.0.0.1');

    ensureExists(STANDALONE_DIR, 'standalone directory');
    ensureExists(SERVER_ENTRY, 'standalone server entry');
    ensureExists(SOURCE_STATIC, 'build static assets');

    copyDirectory(SOURCE_STATIC, TARGET_STATIC);
    copyDirectory(SOURCE_PUBLIC, TARGET_PUBLIC);

    console.log(`[standalone-local] synced static assets to ${TARGET_STATIC}`);
    if (fs.existsSync(SOURCE_PUBLIC)) {
        console.log(`[standalone-local] synced public assets to ${TARGET_PUBLIC}`);
    }

    const child = spawn(process.execPath, [SERVER_ENTRY], {
        cwd: STANDALONE_DIR,
        env: {
            ...process.env,
            PORT: String(port),
            HOSTNAME: host,
        },
        stdio: 'inherit',
    });

    child.on('exit', (code) => process.exit(code ?? 0));
    child.on('error', (error) => {
        console.error(`[standalone-local] failed to start: ${error.message}`);
        process.exit(1);
    });
}

main().catch((error) => {
    console.error(`[standalone-local] ${error.message}`);
    process.exit(1);
});
