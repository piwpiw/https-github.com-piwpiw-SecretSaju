#!/usr/bin/env node

/**
 * 최종 Git 푸시 스크립트
 * GitHub 저장소 URL을 받아서 자동으로 푸시
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🚀 Git 푸시 준비');
  console.log('================\n');

  // 원격 저장소 확인
  let remoteUrl = '';
  try {
    remoteUrl = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
    console.log(`✅ 원격 저장소: ${remoteUrl}\n`);
  } catch (error) {
    console.log('⚠️  원격 저장소가 설정되지 않았습니다.\n');
    const githubUrl = await question('GitHub 저장소 URL을 입력하세요: ');

    if (githubUrl) {
      try {
        execSync(`git remote add origin ${githubUrl}`, { stdio: 'inherit' });
        console.log('✅ 원격 저장소 추가 완료\n');
      } catch (error) {
        console.log('⚠️  원격 저장소 추가 실패. 이미 존재할 수 있습니다.\n');
      }
    }
  }

  // 변경사항 커밋
  console.log('📝 변경사항 커밋...');
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "feat: Supabase 환경 변수 및 최종 설정 완료"', { stdio: 'inherit' });
    console.log('✅ 커밋 완료\n');
  } catch (error) {
    console.log('ℹ️  커밋할 변경사항 없음\n');
  }

  // 브랜치 이름 변경
  try {
    execSync('git branch -M main', { stdio: 'ignore' });
  } catch (error) {
    // 이미 main 브랜치일 수 있음
  }

  // 푸시
  console.log('📤 GitHub에 푸시...');
  try {
    execSync('git push -u origin main', { stdio: 'inherit' });
    console.log('\n✅ 푸시 완료!\n');
  } catch (error) {
    console.log('\n⚠️  푸시 실패. 다음 명령어를 수동으로 실행하세요:\n');
    console.log('   git push -u origin main\n');
  }

  rl.close();
}

main().catch(console.error);
