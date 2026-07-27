#!/usr/bin/env node
/**
 * GitHub Actions 워크플로 YAML 문법 검사.
 *
 * 배경: `.github/workflows/agent-autopilot.yml`의 `script: |` 블록 본문이 키보다
 * 깊게 들여쓰기되지 않아 YAML 파싱이 실패했고, **모든 커밋에서 조용히 실패**하고
 * 있었습니다. 워크플로 파일이 깨지면 GitHub은 잡을 하나도 만들지 못한 채
 * "파일 경로"를 이름으로 하는 실패 런을 남기기 때문에, 로그를 열어도
 * `No failed jobs found` 만 나와 원인을 찾기 어렵습니다.
 *
 * 사용법: node scripts/qa/workflow-lint.mjs
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '.github/workflows';

let files = [];
try {
    files = readdirSync(DIR).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
} catch {
    console.log(`${DIR} 없음 — 검사할 워크플로가 없습니다.`);
    process.exit(0);
}

let parseYaml;
try {
    ({ parse: parseYaml } = await import('yaml'));
} catch {
    console.log('yaml 패키지를 찾을 수 없어 문법 검사를 건너뜁니다.');
    process.exit(0);
}

const failures = [];

for (const file of files) {
    const path = join(DIR, file);
    let doc;
    try {
        doc = parseYaml(readFileSync(path, 'utf8'));
    } catch (error) {
        failures.push(`${path} — YAML 파싱 실패: ${error.message.split('\n')[0]}`);
        continue;
    }

    if (!doc || typeof doc !== 'object') {
        failures.push(`${path} — 최상위가 매핑이 아닙니다.`);
        continue;
    }
    // YAML 1.1에서 `on:` 은 boolean true 로 파싱된다.
    if (!('on' in doc) && !(true in doc)) {
        failures.push(`${path} — 트리거(on:)가 없습니다.`);
    }
    if (!doc.jobs || typeof doc.jobs !== 'object' || !Object.keys(doc.jobs).length) {
        failures.push(`${path} — jobs 가 비어 있습니다.`);
        continue;
    }
    for (const [name, job] of Object.entries(doc.jobs)) {
        if (!job || typeof job !== 'object') {
            failures.push(`${path} — job "${name}" 정의가 비어 있습니다.`);
            continue;
        }
        if (!job.uses && !Array.isArray(job.steps)) {
            failures.push(`${path} — job "${name}" 에 steps 가 없습니다.`);
        }
    }
}

for (const failure of failures) console.log(`INVALID  ${failure}`);

console.log(`\n워크플로 문법 검사: ${files.length}개 파일 → 문제 ${failures.length}건`);
if (failures.length) process.exit(1);
console.log('워크플로 파일 정상.');
