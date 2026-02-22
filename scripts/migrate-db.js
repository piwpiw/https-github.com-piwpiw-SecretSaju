#!/usr/bin/env node

/**
 * Supabase 마이그레이션 실행 스크립트
 * 로컬 Supabase 또는 원격 Supabase에 마이그레이션 적용
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL와 SUPABASE_SERVICE_ROLE_KEY를 설정하세요.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);

  console.log(`📄 마이그레이션 실행: ${fileName}`);

  try {
    // Supabase는 SQL을 직접 실행할 수 없으므로,
    // Supabase Dashboard의 SQL Editor를 사용하거나
    // Supabase CLI를 사용해야 합니다.

    console.log('⚠️  Supabase CLI를 사용하여 마이그레이션을 실행하세요:');
    console.log(`   supabase db push`);
    console.log('');
    console.log('또는 Supabase Dashboard → SQL Editor에서 다음 SQL을 실행하세요:');
    console.log(`   파일: ${filePath}`);
    console.log('');

    // SQL 파일 내용 출력 (선택적)
    if (process.argv.includes('--show-sql')) {
      console.log('--- SQL 내용 ---');
      console.log(sql);
      console.log('--- 끝 ---');
      console.log('');
    }

    return true;
  } catch (error) {
    console.error(`❌ 마이그레이션 실패: ${fileName}`);
    console.error(error);
    return false;
  }
}

async function main() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ migrations 디렉토리를 찾을 수 없습니다.');
    process.exit(1);
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('⚠️  마이그레이션 파일이 없습니다.');
    return;
  }

  console.log('🔄 Supabase 마이그레이션 실행');
  console.log('==============================\n');

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    await runMigration(filePath);
  }

  console.log('✅ 마이그레이션 스크립트 준비 완료');
  console.log('');
  console.log('📋 다음 단계:');
  console.log('1. Supabase CLI 설치: npm i -g supabase');
  console.log('2. 로그인: supabase login');
  console.log('3. 마이그레이션 실행: supabase db push');
  console.log('');
  console.log('또는 Supabase Dashboard → SQL Editor에서 직접 실행하세요.');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runMigration };
