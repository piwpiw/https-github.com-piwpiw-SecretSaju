#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function exec(command, options = {}) {
  return execSync(command, {
    stdio: 'inherit',
    encoding: 'utf-8',
    ...options,
  });
}

async function main() {
  console.log('🚀 Secret Saju - Render 자동 배포 스크립트');

  if (!fs.existsSync('.git')) {
    exec('git init');
    console.log('✅ Git repository initialized');
  }

  const status = exec('git status --porcelain', { encoding: 'utf-8' })?.trim();
  console.log(status ? '⚠️ 변경 사항이 있습니다.' : 'ℹ️ 변경 사항 없음');

  const shouldCommit = (await question('변경사항을 커밋할까요? (y/N): ')).trim().toLowerCase() === 'y';
  if (shouldCommit) {
    const message = (await question('커밋 메시지: ')).trim() || `chore: deploy snapshot ${new Date().toISOString()}`;
    exec('git add -A');
    exec(`git commit -m "${message.replace(/"/g, '\\"')}"`, { ignoreError: true });
  }

  const shouldPush = (await question('GitHub push 하시겠습니까? (y/N): ')).trim().toLowerCase() === 'y';
  if (shouldPush) {
    const pushBranch = await question('push할 브랜치 (기본 main): ');
    const branch = (pushBranch || 'main').trim();
    exec(`git push origin ${branch}`);
  }

  console.log('🚀 Render 배포 트리거 실행');
  if (process.env.RENDER_DEPLOY_HOOK_URL || process.env.RENDER_DEPLOY_HOOK) {
    exec('node scripts/render-deploy.js');
  } else {
    console.log('ℹ️ RENDER_DEPLOY_HOOK_URL이 없어도 main 브랜치 기준 autoDeploy가 설정되어 있으면 Render가 자동 배포합니다.');
  }

  console.log('✅ 완료');
  rl.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
