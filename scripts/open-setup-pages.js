#!/usr/bin/env node

/**
 * 필요한 설정 페이지들을 브라우저에서 자동으로 열기
 */

const { exec } = require('child_process');

const pages = [
  {
    name: 'Supabase Dashboard',
    url: 'https://supabase.com/dashboard/project/jyrdihklwkbeypfxbiwp',
    description: 'Supabase 프로젝트 설정 및 SQL Editor'
  },
  {
    name: 'Vercel Login',
    url: 'https://vercel.com/login',
    description: 'Vercel 로그인 및 프로젝트 생성'
  },
  {
    name: 'GitHub New Repository',
    url: 'https://github.com/new',
    description: 'GitHub 새 저장소 생성'
  },
  {
    name: 'Kakao Developers',
    url: 'https://developers.kakao.com',
    description: '카카오 개발자 콘솔 (OAuth 설정)'
  },
  {
    name: 'Toss Payments',
    url: 'https://www.tosspayments.com',
    description: '토스페이먼츠 (결제 설정)'
  }
];

function openBrowser(url) {
  const command = process.platform === 'win32'
    ? `start ${url}`
    : process.platform === 'darwin'
    ? `open ${url}`
    : `xdg-open ${url}`;

  return new Promise((resolve) => {
    exec(command, (error) => {
      if (error) {
        console.error(`❌ ${url} 열기 실패:`, error.message);
      }
      resolve();
    });
  });
}

async function main() {
  console.log('🌐 필요한 설정 페이지들을 엽니다...\n');

  for (const page of pages) {
    console.log(`📂 ${page.name} 열기 중...`);
    console.log(`   ${page.description}`);
    await openBrowser(page.url);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
  }

  console.log('\n✅ 모든 페이지가 열렸습니다!');
  console.log('\n📋 다음 단계:');
  console.log('1. Supabase: SQL Editor에서 마이그레이션 실행');
  console.log('2. Vercel: 로그인 후 프로젝트 생성');
  console.log('3. GitHub: 새 저장소 생성 (SecretSaju)');
  console.log('4. npm run setup:complete 실행\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { openBrowser };
