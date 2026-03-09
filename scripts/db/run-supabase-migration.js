#!/usr/bin/env node

/**
 * Supabase 마이그레이션 자동 실행
 * REST API를 통해 SQL 실행
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jyrdihklwkbeypfxbiwp.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SQL 실행 실패: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function executeMigration(filePath) {
  console.log(`\n📄 마이그레이션 실행: ${path.basename(filePath)}`);

  const sql = fs.readFileSync(filePath, 'utf-8');

  // SQL을 세미콜론으로 분리하여 하나씩 실행
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.length < 10) continue; // 너무 짧은 문장 스킵

    try {
      // Supabase REST API는 직접 SQL 실행을 지원하지 않으므로
      // SQL Editor를 사용해야 함
      console.log('⚠️  Supabase REST API는 직접 SQL 실행을 지원하지 않습니다.');
      console.log('   SQL Editor에서 수동으로 실행해야 합니다.\n');
      return false;
    } catch (error) {
      console.error(`❌ 오류: ${error.message}`);
      return false;
    }
  }

  return true;
}

async function main() {
  console.log('🗄️  Supabase 마이그레이션 실행');
  console.log('================================\n');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrationFiles = [
    '001_initial_schema.sql',
    '002_add_orders_table.sql'
  ];

  console.log('⚠️  Supabase REST API는 직접 SQL 실행을 지원하지 않습니다.');
  console.log('   SQL Editor에서 수동으로 실행해야 합니다.\n');

  console.log('📋 다음 단계:');
  console.log('1. https://supabase.com/dashboard/project/jyrdihklwkbeypfxbiwp 접속');
  console.log('2. SQL Editor 열기');
  console.log('3. 다음 파일들을 순서대로 실행:\n');

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`);
      console.log(`      위치: ${filePath}\n`);
    }
  }

  console.log('💡 팁: SQL 파일 내용을 복사하여 SQL Editor에 붙여넣고 Run 클릭');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeMigration };
