#!/usr/bin/env node

/**
 * 완전 자동화 배포 스크립트
 * 필요한 값만 사용자에게 물어보고 나머지는 자동 처리
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function exec(command, options = {}) {
  try {
    return execSync(command, { 
      stdio: 'inherit', 
      encoding: 'utf-8',
      ...options 
    });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return null;
  }
}

async function main() {
  console.log('🚀 Secret Saju - 완전 자동화 배포');
  console.log('=====================================\n');

  // 1. Git 상태 확인
  console.log('📦 1단계: Git 상태 확인...');
  const isGitRepo = fs.existsSync('.git');
  if (!isGitRepo) {
    exec('git init');
    console.log('✅ Git 초기화 완료\n');
  }

  // 2. GitHub 저장소 확인 및 설정
  console.log('🔗 2단계: GitHub 저장소 설정...');
  let remoteUrl = '';
  try {
    remoteUrl = exec('git remote get-url origin', { encoding: 'utf-8', ignoreError: true })?.trim();
  } catch {}

  if (!remoteUrl) {
    console.log('\n📝 GitHub 저장소 URL이 필요합니다.');
    console.log('   예: https://github.com/piwpiw/SecretSaju.git');
    const githubUrl = await question('GitHub 저장소 URL: ');
    
    if (githubUrl) {
      exec(`git remote add origin ${githubUrl}`, { ignoreError: true });
      exec(`git remote set-url origin ${githubUrl}`, { ignoreError: true });
      console.log('✅ GitHub 원격 저장소 설정 완료\n');
    }
  } else {
    console.log(`✅ GitHub 원격 저장소: ${remoteUrl}\n`);
  }

  // 3. 커밋 및 푸시
  console.log('📝 3단계: 변경사항 커밋...');
  try {
    exec('git add .');
    const status = exec('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim()) {
      exec('git commit -m "feat: 배포 준비 완료 - 과금 최소화 최적화"', { ignoreError: true });
      console.log('✅ 커밋 완료\n');
    } else {
      console.log('ℹ️  커밋할 변경사항 없음\n');
    }
  } catch (error) {
    console.log('⚠️  커밋 스킵\n');
  }

  // 4. Supabase 환경 변수 확인
  console.log('🗄️  4단계: Supabase 설정...');
  const envFile = path.join(process.cwd(), '.env.local');
  let hasSupabase = false;
  
  if (fs.existsSync(envFile)) {
    const envContent = fs.readFileSync(envFile, 'utf-8');
    hasSupabase = envContent.includes('NEXT_PUBLIC_SUPABASE_URL') && 
                  envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (!hasSupabase) {
    console.log('\n📝 Supabase 환경 변수가 필요합니다.');
    console.log('   https://supabase.com/dashboard/project/jyrdihklwkbeypfxbiwp 접속');
    console.log('   Settings → API에서 다음 값들을 복사하세요:\n');
    
    const supabaseUrl = await question('NEXT_PUBLIC_SUPABASE_URL: ');
    const supabaseAnonKey = await question('NEXT_PUBLIC_SUPABASE_ANON_KEY: ');
    const supabaseServiceKey = await question('SUPABASE_SERVICE_ROLE_KEY: ');

    if (supabaseUrl && supabaseAnonKey && supabaseServiceKey) {
      const envContent = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}
`;
      fs.appendFileSync(envFile, envContent, { flag: 'a' });
      console.log('✅ Supabase 환경 변수 저장 완료\n');
    }
  } else {
    console.log('✅ Supabase 환경 변수 확인 완료\n');
  }

  // 5. Supabase 마이그레이션 안내
  console.log('📋 5단계: Supabase 마이그레이션 안내...');
  console.log('\n브라우저를 열어 Supabase Dashboard에서 마이그레이션을 실행하세요.');
  console.log('자동으로 브라우저를 열까요? (y/n)');
  const openBrowser = await question('브라우저 열기 (y/n): ');
  
  if (openBrowser.toLowerCase() === 'y') {
    const { exec: execAsync } = require('child_process');
    const url = 'https://supabase.com/dashboard/project/jyrdihklwkbeypfxbiwp/sql/new';
    const command = process.platform === 'win32' 
      ? `start ${url}`
      : process.platform === 'darwin'
      ? `open ${url}`
      : `xdg-open ${url}`;
    
    execAsync(command);
    console.log('✅ 브라우저 열림\n');
    
    console.log('📝 SQL Editor에서 다음 파일들을 실행하세요:');
    console.log('   1. supabase/migrations/001_initial_schema.sql');
    console.log('   2. supabase/migrations/002_add_orders_table.sql\n');
    
    await question('마이그레이션 완료 후 Enter를 누르세요...');
  }

  // 6. Vercel 배포
  console.log('\n🌐 6단계: Vercel 배포...');
  const hasVercel = exec('vercel whoami', { encoding: 'utf-8', ignoreError: true });
  
  if (!hasVercel) {
    console.log('Vercel CLI 로그인이 필요합니다.');
    console.log('브라우저에서 로그인하세요...\n');
    exec('vercel login');
  }

  console.log('Vercel 프로젝트 배포를 시작합니다...\n');
  exec('vercel --prod --yes');

  // 7. GitHub 푸시
  console.log('\n📤 7단계: GitHub에 푸시...');
  const push = await question('GitHub에 푸시하시겠습니까? (y/n): ');
  
  if (push.toLowerCase() === 'y') {
    try {
      exec('git branch -M main', { ignoreError: true });
      exec('git push -u origin main', { ignoreError: true });
      console.log('✅ GitHub 푸시 완료\n');
    } catch (error) {
      console.log('⚠️  푸시 실패 (나중에 수동으로 푸시하세요)\n');
    }
  }

  console.log('\n🎉 배포 완료!');
  console.log('\n📋 다음 단계:');
  console.log('1. Vercel Dashboard에서 환경 변수 설정');
  console.log('2. 배포 URL 확인 및 테스트');
  console.log('3. 카카오 로그인 및 결제 테스트\n');

  rl.close();
}

main().catch(console.error);
