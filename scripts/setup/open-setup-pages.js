#!/usr/bin/env node

/**
 * 배포 준비 링크 오픈 헬퍼
 */

const { exec } = require('child_process');

const pages = [
  {
    name: 'Supabase Dashboard',
    url: 'https://supabase.com/dashboard/project/jyrdihklwkbeypfxbiwp',
    description: 'Supabase 프로젝트 설정 및 SQL Editor 접근'
  },
  {
    name: 'Render Dashboard',
    url: 'https://dashboard.render.com',
    description: 'Render 대시보드에서 배포 서비스/도메인/환경변수 확인'
  },
  {
    name: 'GitHub New Repository',
    url: 'https://github.com/new',
    description: 'GitHub 저장소 생성'
  },
  {
    name: 'Kakao Developers',
    url: 'https://developers.kakao.com',
    description: 'OAuth(카카오 로그인) 설정'
  },
  {
    name: 'Toss Payments',
    url: 'https://www.tosspayments.com',
    description: '결제 설정'
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
  console.log('🚀 배포 준비 링크를 오픈합니다..\n');

  for (const page of pages) {
    console.log(`➡ ${page.name} 열기 중..`);
    console.log(`   ${page.description}`);
    await openBrowser(page.url);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
  }

  console.log('\n✅ 모든 링크 오픈 완료.');
  console.log('\n📋 다음 체크리스트:');
  console.log('1. Supabase: SQL Editor에서 Auth / DB 설정 확인');
  console.log('2. Render: 서비스 생성 후 환경변수 등록 및 배포 상태 확인');
  console.log('3. GitHub: 저장소 생성 및 origin 연결 (SecretSaju)');
  console.log('4. npm run setup:complete 실행\n');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { openBrowser };


