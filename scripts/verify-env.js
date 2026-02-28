#!/usr/bin/env node

/**
 * 환경 변수 검증 스크립트
 * 배포 전 필수 환경 변수가 모두 설정되었는지 확인
 */

const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

const requiredEnvVars = {
  // 애플리케이션
  NEXT_PUBLIC_BASE_URL: '애플리케이션 기본 URL',
  NEXT_PUBLIC_APP_URL: '애플리케이션 URL',

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: 'Supabase URL',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'Supabase Anon Key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase Service Role Key',

  // Kakao OAuth
  NEXT_PUBLIC_KAKAO_JS_KEY: 'Kakao JavaScript Key',
  KAKAO_REST_API_KEY: 'Kakao REST API Key',
  KAKAO_CLIENT_SECRET: 'Kakao Client Secret',
  KAKAO_REDIRECT_URI: 'Kakao Redirect URI',

  // Toss Payments
  NEXT_PUBLIC_TOSS_CLIENT_KEY: 'Toss Payments Client Key',
  TOSS_SECRET_KEY: 'Toss Payments Secret Key',
};

const optionalEnvVars = {
  NEXT_PUBLIC_GA_ID: 'Google Analytics ID',
  NODE_ENV: 'Node Environment',
};

function verifyEnv() {
  const missing = [];
  const warnings = [];

  console.log('🔍 환경 변수 검증 중...\n');

  // 필수 변수 확인
  for (const [key, description] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      missing.push({ key, description });
    } else {
      // 민감한 정보는 마스킹하여 표시
      const masked = key.includes('SECRET') || key.includes('KEY')
        ? `${value.substring(0, 8)}...`
        : value;
      console.log(`✅ ${key}: ${masked}`);
    }
  }

  // 선택적 변수 확인
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    const value = process.env[key];
    if (!value || value.trim() === '') {
      warnings.push({ key, description });
    } else {
      console.log(`⚠️  ${key}: ${value} (선택적)`);
    }
  }

  console.log('\n');

  // 결과 출력
  if (missing.length > 0) {
    console.error('❌ 필수 환경 변수가 누락되었습니다:\n');
    missing.forEach(({ key, description }) => {
      console.error(`   - ${key}: ${description}`);
    });
    console.error('\n환경 변수를 설정한 후 다시 시도하세요.');
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  선택적 환경 변수가 설정되지 않았습니다:\n');
    warnings.forEach(({ key, description }) => {
      console.warn(`   - ${key}: ${description}`);
    });
    console.warn('\n기능이 제한될 수 있습니다.\n');
  }

  console.log('✅ 모든 필수 환경 변수가 설정되었습니다!');
  return true;
}

// 실행
if (require.main === module) {
  verifyEnv();
}

module.exports = { verifyEnv };
