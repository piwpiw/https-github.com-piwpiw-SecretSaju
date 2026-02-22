#!/usr/bin/env node

/**
 * 배포 전 검증 스크립트
 * 모든 필수 사항이 준비되었는지 확인
 */

const { verifyEnv } = require('./verify-env');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function checkBuild() {
  console.log('🏗️  빌드 테스트 중...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ 빌드 성공\n');
    return true;
  } catch (error) {
    console.error('❌ 빌드 실패\n');
    return false;
  }
}

function checkTests() {
  console.log('🧪 테스트 실행 중...');
  try {
    execSync('npm test -- --run', { stdio: 'inherit' });
    console.log('✅ 테스트 통과\n');
    return true;
  } catch (error) {
    console.error('❌ 테스트 실패\n');
    return false;
  }
}

function checkMigrations() {
  console.log('📋 마이그레이션 파일 확인 중...');
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ migrations 디렉토리가 없습니다.\n');
    return false;
  }

  const migrations = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'));

  if (migrations.length === 0) {
    console.warn('⚠️  마이그레이션 파일이 없습니다.\n');
    return false;
  }

  console.log(`✅ 마이그레이션 파일 ${migrations.length}개 발견\n`);
  return true;
}

function checkConfigFiles() {
  console.log('⚙️  설정 파일 확인 중...');

  const requiredFiles = [
    'vercel.json',
    '.github/workflows/deploy.yml',
    'package.json',
  ];

  const missing = [];
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      missing.push(file);
    }
  }

  if (missing.length > 0) {
    console.error('❌ 필수 파일이 누락되었습니다:');
    missing.forEach(file => console.error(`   - ${file}`));
    console.error('');
    return false;
  }

  console.log('✅ 모든 설정 파일 존재\n');
  return true;
}

async function main() {
  console.log('🚀 배포 전 검증 시작\n');
  console.log('='.repeat(50));
  console.log('');

  const results = {
    env: false,
    build: false,
    tests: false,
    migrations: false,
    config: false,
  };

  // 환경 변수 검증
  try {
    results.env = verifyEnv();
  } catch (error) {
    console.error('환경 변수 검증 실패:', error.message);
  }

  console.log('');

  // 설정 파일 확인
  results.config = checkConfigFiles();

  // 마이그레이션 확인
  results.migrations = checkMigrations();

  // 테스트 실행 (옵션)
  if (process.argv.includes('--skip-tests')) {
    console.log('⏭️  테스트 건너뛰기\n');
    results.tests = true;
  } else {
    results.tests = checkTests();
  }

  // 빌드 테스트 (옵션)
  if (process.argv.includes('--skip-build')) {
    console.log('⏭️  빌드 테스트 건너뛰기\n');
    results.build = true;
  } else {
    results.build = checkBuild();
  }

  // 결과 요약
  console.log('='.repeat(50));
  console.log('📊 검증 결과 요약');
  console.log('='.repeat(50));
  console.log(`환경 변수:     ${results.env ? '✅' : '❌'}`);
  console.log(`설정 파일:     ${results.config ? '✅' : '❌'}`);
  console.log(`마이그레이션:   ${results.migrations ? '✅' : '❌'}`);
  console.log(`테스트:        ${results.tests ? '✅' : '❌'}`);
  console.log(`빌드:          ${results.build ? '✅' : '❌'}`);
  console.log('');

  const allPassed = Object.values(results).every(v => v === true);

  if (allPassed) {
    console.log('✅ 모든 검증을 통과했습니다! 배포 준비 완료.');
    process.exit(0);
  } else {
    console.error('❌ 일부 검증을 통과하지 못했습니다. 위의 오류를 수정하세요.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
